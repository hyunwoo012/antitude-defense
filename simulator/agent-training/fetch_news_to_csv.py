import os
import csv
import requests
from typing import List, Dict, Any

NEWS_API_KEY = "39055aa3a3304c988a17e09c6642c620"
NEWS_API_URL = "https://newsapi.org/v2/everything"


def fetch_news(
    query: str,
    from_date: str,
    to_date: str,
    language: str = "en",
    sort_by: str = "publishedAt",
    page_size: int = 20,
    page: int = 1,
) -> List[Dict[str, Any]]:
    """
    NewsAPI에서 기사 목록을 가져온다.
    공식 문서 기준 /v2/everything 엔드포인트 사용.
    """
    params = {
        "q": query,
        "from": from_date,
        "to": to_date,
        "language": language,
        "sortBy": sort_by,
        "pageSize": page_size,
        "page": page,
        "apiKey": NEWS_API_KEY,
    }

    response = requests.get(NEWS_API_URL, params=params, timeout=20)
    response.raise_for_status()
    data = response.json()

    if data.get("status") != "ok":
        raise RuntimeError(f"News API error: {data}")

    return data.get("articles", [])


def build_text(article: Dict[str, Any]) -> str:
    """
    제목 + 설명 + 본문을 하나의 text 필드로 합친다.
    None 방지 포함.
    """
    title = article.get("title") or ""
    description = article.get("description") or ""
    content = article.get("content") or ""

    parts = [title.strip(), description.strip(), content.strip()]
    parts = [p for p in parts if p]
    return " ".join(parts)


def articles_to_rows(articles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    라벨링용 CSV 행 구조로 변환한다.
    아직 라벨은 빈칸으로 둔다.
    """
    rows = []
    for idx, article in enumerate(articles, start=1):
        row = {
            "id": idx,
            "text": build_text(article),
            "sentiment": "",
            "event_type": "",
            "market_regime": "",
            "tone": "",
            "source": (article.get("source") or {}).get("name", ""),
            "published_at": article.get("publishedAt", ""),
            "note": "",
            "title": article.get("title", "") or "",
            "url": article.get("url", "") or "",
        }
        rows.append(row)
    return rows


def save_rows_to_csv(rows: List[Dict[str, Any]], output_path: str) -> None:
    """
    CSV로 저장한다.
    """
    fieldnames = [
        "id",
        "text",
        "sentiment",
        "event_type",
        "market_regime",
        "tone",
        "source",
        "published_at",
        "note",
        "title",
        "url",
    ]

    with open(output_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    query = "Federal Reserve OR inflation OR earnings OR stock market"
    from_date = "2026-03-20"
    to_date = "2026-04-03"

    articles = fetch_news(
        query=query,
        from_date=from_date,
        to_date=to_date,
        language="en",
        sort_by="publishedAt",
        page_size=20,
        page=1,
    )

    rows = articles_to_rows(articles)
    save_rows_to_csv(rows, "news_labeling_template.csv")

    print(f"Saved {len(rows)} rows to news_labeling_template.csv")


if __name__ == "__main__":
    main()