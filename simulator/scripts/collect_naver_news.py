import os
import re
import time
import html
from typing import List, Dict

import requests
import pandas as pd
from bs4 import BeautifulSoup
from dotenv import load_dotenv


# -----------------------------------
# 경로 설정
# -----------------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(BASE_DIR, ".env")

RAW_DIR = os.path.join(BASE_DIR, "data", "raw")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")

RAW_OUTPUT_PATH = os.path.join(RAW_DIR, "korean_fin_news_raw.csv")
AUTO_LABELED_OUTPUT_PATH = os.path.join(PROCESSED_DIR, "korean_fin_news_auto_labeled.csv")

os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

load_dotenv(ENV_PATH)

NAVER_CLIENT_ID = os.getenv("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET")

if not NAVER_CLIENT_ID or not NAVER_CLIENT_SECRET:
    raise ValueError(
        f".env 로딩 실패 또는 키 누락.\n"
        f"확인할 파일: {ENV_PATH}\n"
        f"NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 값을 넣어야 합니다."
    )

SEARCH_URL = "https://openapi.naver.com/v1/search/news.json"

API_HEADERS = {
    "X-Naver-Client-Id": NAVER_CLIENT_ID,
    "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
}

REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )
}

# -----------------------------------
# 검색어 세트
# 고정 쿼리 + 보강 쿼리 혼합
# -----------------------------------
QUERY_LIST = [
    # negative 보강
    "기준금리 인상",
    "금리 인하 기대 후퇴",
    "인플레이션 우려",
    "국제유가 급등",
    "리스크 오프",
    "연준 매파",
    "고용 서프라이즈 금리",
    "국채금리 상승",
    "환율 급등",
    "안전자산 선호",

    # positive 보강
    "기준금리 인하",
    "금리 인하 기대",
    "물가 둔화",
    "인플레 완화",
    "투자심리 개선",
    "증시 반등",
    "연준 완화",
    "비둘기파 발언",
    "안도 랠리",
    "경기 부양 기대",

    # neutral 보강
    "금리 동결 전망",
    "시장 관망세",
    "증시 혼조",
    "정책 유지 가능성",
    "전망 엇갈려",
    "방향성 탐색",
    "변수 주시",
    "발표 앞두고 관망"
]

# -----------------------------------
# 자동 라벨 키워드
# -----------------------------------
NEGATIVE_KEYWORDS = [
    "금리 인상", "금리인상", "인상 가능성", "금리 동결", "동결 전망",
    "금리 인하 기대 후퇴", "인하 기대 후퇴", "긴축", "매파",
    "인플레이션 우려", "물가 상승", "고유가", "유가 급등",
    "리스크 오프", "환율 상승", "달러 강세", "국채금리 상승",
    "고용 호조", "고용 서프라이즈", "실업률 하락", "안전자산 선호"
]

POSITIVE_KEYWORDS = [
    "금리 인하", "금리인하", "인하 기대", "완화", "비둘기파",
    "물가 둔화", "인플레이션 완화", "투자심리 개선", "증시 반등",
    "안도 랠리", "부담 완화", "경기 부양", "회복세"
]

NEUTRAL_KEYWORDS = [
    "관망", "혼조", "전망 엇갈려", "방향성 탐색", "정책 유지", "주시"
]


# -----------------------------------
# 텍스트 정리 함수
# -----------------------------------
def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = html.unescape(text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def split_sentences_kor(text: str) -> List[str]:
    if not text:
        return []
    # 단순 문장 분리
    parts = re.split(r'(?<=[\.\!\?다요])\s+', text)
    return [p.strip() for p in parts if p.strip()]


def remove_noise_patterns(text: str) -> str:
    if not text:
        return ""

    noise_patterns = [
        r"저작권자.+",
        r"무단전재.+",
        r"기자의 다른기사.+",
        r"관련기사.+",
        r"댓글.+",
        r"많이 본 기사.+",
        r"기사목록.+",
        r"공유하기.+",
        r"URL 복사.+",
        r"로그인.+",
        r"회원가입.+",
        r"광고문의.+",
        r"대표전화.+",
        r"Copyright.+",
        r"저작권.*금지.+",
        r"※.+",
        r"ⓒ.+",
    ]

    cleaned = text
    for pattern in noise_patterns:
        cleaned = re.sub(pattern, " ", cleaned, flags=re.IGNORECASE)

    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


def make_training_text(title: str, article_text: str, max_sentences: int = 3, max_chars: int = 500) -> str:
    title = clean_text(title)
    article_text = clean_text(article_text)
    article_text = remove_noise_patterns(article_text)

    sentences = split_sentences_kor(article_text)
    lead = " ".join(sentences[:max_sentences]).strip()

    merged = f"{title}. {lead}".strip()
    merged = re.sub(r"\s+", " ", merged).strip()

    if len(merged) > max_chars:
        merged = merged[:max_chars].rsplit(" ", 1)[0]

    return merged


# -----------------------------------
# 네이버 뉴스 검색
# -----------------------------------
def search_naver_news(query: str, display: int = 100, start: int = 1, sort: str = "date") -> List[Dict]:
    params = {
        "query": query,
        "display": display,
        "start": start,
        "sort": sort,
    }

    response = requests.get(
        SEARCH_URL,
        headers=API_HEADERS,
        params=params,
        timeout=15
    )
    response.raise_for_status()

    data = response.json()
    return data.get("items", [])


# -----------------------------------
# 본문 추출
# -----------------------------------
def extract_article_text(url: str) -> str:
    try:
        res = requests.get(url, headers=REQUEST_HEADERS, timeout=15)
        res.raise_for_status()

        soup = BeautifulSoup(res.text, "html.parser")

        for tag in soup(["script", "style", "noscript", "iframe", "header", "footer"]):
            tag.decompose()

        candidates = []

        selectors = [
            "#dic_area",
            "#newsct_article",
            "#articeBody",
            "#articleBody",
            ".news_end",
            ".article_view",
            ".article_txt",
            ".view_txt",
            ".article-body",
            ".article-body-wrap",
            ".news_body",
            "article",
        ]

        for sel in selectors:
            node = soup.select_one(sel)
            if node:
                text = node.get_text(" ", strip=True)
                text = re.sub(r"\s+", " ", text).strip()
                if len(text) > 150:
                    candidates.append(text)

        if candidates:
            text = max(candidates, key=len)
        else:
            text = soup.get_text(" ", strip=True)
            text = re.sub(r"\s+", " ", text).strip()

        text = remove_noise_patterns(text)

        if len(text) < 50:
            return ""

        return text

    except Exception:
        return ""


# -----------------------------------
# 자동 라벨 후보
# -----------------------------------
def score_keywords(text: str, keywords: List[str]) -> int:
    score = 0
    for kw in keywords:
        if kw in text:
            score += 1
    return score


def auto_label(text: str) -> str:
    text = str(text).strip()

    neg_score = score_keywords(text, NEGATIVE_KEYWORDS)
    pos_score = score_keywords(text, POSITIVE_KEYWORDS)
    neu_score = score_keywords(text, NEUTRAL_KEYWORDS)

    if neg_score == 0 and pos_score == 0 and neu_score == 0:
        return "review"

    if neg_score > pos_score and neg_score >= neu_score:
        return "negative"
    if pos_score > neg_score and pos_score >= neu_score:
        return "positive"
    if neu_score > neg_score and neu_score > pos_score:
        return "neutral"

    return "review"


# -----------------------------------
# 수집
# -----------------------------------
def collect_news(max_articles: int = 200) -> pd.DataFrame:
    rows = []
    seen_urls = set()
    seen_texts = set()
    current_id = 1

    for query in QUERY_LIST:
        try:
            items = search_naver_news(query=query, display=100, start=1, sort="date")
        except Exception as e:
            print(f"[검색 실패] query={query} / error={e}")
            continue

        for item in items:
            title = clean_text(item.get("title", ""))
            description = clean_text(item.get("description", ""))
            pub_date = item.get("pubDate", "")

            original_url = item.get("originallink") or ""
            naver_url = item.get("link") or ""

            target_url = original_url if original_url else naver_url

            if not target_url or target_url in seen_urls:
                continue

            seen_urls.add(target_url)

            full_text = extract_article_text(target_url)

            if not full_text:
                fallback_text = f"{title}. {description}".strip()
                full_text = re.sub(r"\s+", " ", fallback_text).strip()

            if len(full_text) < 30:
                continue

            training_text = make_training_text(
                title=title,
                article_text=full_text,
                max_sentences=3,
                max_chars=500
            )

            if len(training_text) < 30:
                continue

            # text 중복 제거
            dedup_key = training_text[:200]
            if dedup_key in seen_texts:
                continue
            seen_texts.add(dedup_key)

            auto_sentiment = auto_label(training_text)

            row = {
                "id": current_id,
                "title": title,
                "text": training_text,          # 학습용 짧은 텍스트
                "full_text": full_text,         # 원문 보관
                "sentiment": "",                # 사람이 최종 라벨링
                "auto_sentiment": auto_sentiment,  # 자동 후보 라벨
                "event_type": "",
                "market_regime": "",
                "tone": "",
                "source": "naver_news_search_api",
                "published_at": pub_date,
                "url": target_url,
                "note": query,
            }

            rows.append(row)
            print(f"[수집 완료] {current_id}/{max_articles} - {title[:60]} -> auto={auto_sentiment}")
            current_id += 1

            if len(rows) >= max_articles:
                return pd.DataFrame(rows)

            time.sleep(0.25)

    return pd.DataFrame(rows)


def main():
    print("[수집 시작]")
    df = collect_news(max_articles=200)

    if df.empty:
        print("수집된 뉴스가 없습니다.")
        return

    df.to_csv(RAW_OUTPUT_PATH, index=False, encoding="utf-8-sig")
    print(f"\nRAW 저장 완료: {RAW_OUTPUT_PATH}")

    # auto_labeled 파일도 별도로 저장
    auto_df = df.copy()
    auto_df.to_csv(AUTO_LABELED_OUTPUT_PATH, index=False, encoding="utf-8-sig")
    print(f"AUTO LABELED 저장 완료: {AUTO_LABELED_OUTPUT_PATH}")

    print("\n[auto_sentiment 분포]")
    print(auto_df["auto_sentiment"].value_counts(dropna=False))


if __name__ == "__main__":
    main()