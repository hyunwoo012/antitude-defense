import os
import random
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INPUT_PATH = os.path.join(BASE_DIR, "data", "labeled", "korean_fin_news_labeled.csv")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")

LABEL_MAP = {
    "negative": 0,
    "neutral": 1,
    "positive": 2
}


def simple_split(df, train_ratio=0.7, val_ratio=0.15, test_ratio=0.15, seed=42):
    if abs(train_ratio + val_ratio + test_ratio - 1.0) > 1e-8:
        raise ValueError("train_ratio + val_ratio + test_ratio must equal 1.0")

    indices = list(df.index)
    random.seed(seed)
    random.shuffle(indices)

    n = len(indices)
    train_end = int(n * train_ratio)
    val_end = train_end + int(n * val_ratio)

    train_idx = indices[:train_end]
    val_idx = indices[train_end:val_end]
    test_idx = indices[val_end:]

    train_df = df.loc[train_idx].reset_index(drop=True)
    val_df = df.loc[val_idx].reset_index(drop=True)
    test_df = df.loc[test_idx].reset_index(drop=True)

    return train_df, val_df, test_df


def main():
    if not os.path.exists(INPUT_PATH):
        raise FileNotFoundError(f"라벨링 파일이 없습니다: {INPUT_PATH}")

    df = pd.read_csv(INPUT_PATH)

    # 컬럼 정리
    df["text"] = df["text"].fillna("").astype(str).str.strip()
    df["sentiment"] = df["sentiment"].fillna("").astype(str).str.strip().str.lower()

    # exclude 제거
    df = df[df["sentiment"] != "exclude"].copy()

    # 유효 라벨만 남기기
    df = df[df["sentiment"].isin(LABEL_MAP.keys())].copy()

    # 빈 텍스트 제거
    df = df[df["text"].str.len() > 0].copy()

    if len(df) < 5:
        raise ValueError(f"유효 데이터가 너무 적습니다. 현재 {len(df)}개")

    # 숫자 라벨 생성
    df["label"] = df["sentiment"].map(LABEL_MAP)

    os.makedirs(PROCESSED_DIR, exist_ok=True)

    # 데이터가 적으면 train/val만
    if len(df) < 15:
        train_df, val_df, _ = simple_split(
            df,
            train_ratio=0.8,
            val_ratio=0.2,
            test_ratio=0.0,
            seed=42
        )

        train_path = os.path.join(PROCESSED_DIR, "train.csv")
        val_path = os.path.join(PROCESSED_DIR, "val.csv")

        train_df.to_csv(train_path, index=False, encoding="utf-8-sig")
        val_df.to_csv(val_path, index=False, encoding="utf-8-sig")

        print("데이터가 적어서 train / val만 생성했습니다.")
        print(f"전체 데이터 수: {len(df)}")
        print(f"train: {len(train_df)} -> {train_path}")
        print(f"val:   {len(val_df)} -> {val_path}")
        return

    # 데이터가 15개 이상이면 train/val/test
    train_df, val_df, test_df = simple_split(
        df,
        train_ratio=0.7,
        val_ratio=0.15,
        test_ratio=0.15,
        seed=42
    )

    train_path = os.path.join(PROCESSED_DIR, "train.csv")
    val_path = os.path.join(PROCESSED_DIR, "val.csv")
    test_path = os.path.join(PROCESSED_DIR, "test.csv")

    train_df.to_csv(train_path, index=False, encoding="utf-8-sig")
    val_df.to_csv(val_path, index=False, encoding="utf-8-sig")
    test_df.to_csv(test_path, index=False, encoding="utf-8-sig")

    print("split 완료")
    print(f"전체 데이터 수: {len(df)}")
    print(f"train: {len(train_df)} -> {train_path}")
    print(f"val:   {len(val_df)} -> {val_path}")
    print(f"test:  {len(test_df)} -> {test_path}")


if __name__ == "__main__":
    main()