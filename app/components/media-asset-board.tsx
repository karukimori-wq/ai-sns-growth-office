"use client";

import { useEffect, useState } from "react";
import { DashboardMediaAsset, subscribeMediaAssetCreated } from "./dashboard-events";

export function MediaAssetBoard({ initialMediaAssets }: { initialMediaAssets: DashboardMediaAsset[] }) {
  const [mediaAssets, setMediaAssets] = useState(initialMediaAssets);

  useEffect(() => {
    return subscribeMediaAssetCreated((mediaAsset) => {
      setMediaAssets((current) => [
        mediaAsset,
        ...current.filter((item) => item.id !== mediaAsset.id)
      ]);
    });
  }, []);

  return (
    <div className="assetList" aria-live="polite">
      {mediaAssets.map((asset) => (
        <article className="assetCard" key={asset.id}>
          <div className="assetPreview">IMG</div>
          <div>
            <strong>{asset.type === "image" ? "X投稿画像案" : asset.type}</strong>
            <p>{asset.concept}</p>
          </div>
          <span className={`taskStatus ${asset.status}`}>{asset.status === "waiting_approval" ? "確認待ち" : asset.status}</span>
        </article>
      ))}
    </div>
  );
}
