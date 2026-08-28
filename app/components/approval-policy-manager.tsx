"use client";

import { useEffect, useState } from "react";
import type { ApprovalPolicy } from "../lib/dashboard-data";

type ApprovalPolicyManagerProps = {
  initialPolicies: ApprovalPolicy[];
};

const storageKey = "ai-sns-growth-office:approval-policies";

export function ApprovalPolicyManager({ initialPolicies }: ApprovalPolicyManagerProps) {
  const [policies, setPolicies] = useState(initialPolicies);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);

    if (!saved) {
      return;
    }

    try {
      const savedModes = JSON.parse(saved) as Record<string, ApprovalPolicy["decisionMode"]>;
      setPolicies((current) =>
        current.map((policy) => ({
          ...policy,
          decisionMode: savedModes[policy.id] ?? policy.decisionMode
        }))
      );
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  function updatePolicy(id: string, decisionMode: ApprovalPolicy["decisionMode"]) {
    setPolicies((current) => {
      const next = current.map((policy) => (policy.id === id ? { ...policy, decisionMode } : policy));
      const savedModes = Object.fromEntries(next.map((policy) => [policy.id, policy.decisionMode]));
      window.localStorage.setItem(storageKey, JSON.stringify(savedModes));
      return next;
    });
  }

  return (
    <div className="approvalPolicyList">
      {policies.map((policy) => (
        <article className="approvalPolicyCard" key={policy.id}>
          <div>
            <span className={`decisionType ${policy.decisionMode === "approval" ? "approval" : "delegated"}`}>
              {policy.decisionMode === "approval" ? "承認" : "委任"}
            </span>
            <strong>{policy.label}</strong>
            <p>{policy.reason}</p>
          </div>
          <div className="policyActions" aria-label={`${policy.label}の承認設定`}>
            <button
              className={policy.decisionMode === "approval" ? "active" : ""}
              onClick={() => updatePolicy(policy.id, "approval")}
              type="button"
            >
              承認
            </button>
            <button
              className={policy.decisionMode === "delegated" ? "active" : ""}
              onClick={() => updatePolicy(policy.id, "delegated")}
              type="button"
            >
              委任
            </button>
            <small>{policy.owner}</small>
          </div>
        </article>
      ))}
    </div>
  );
}
