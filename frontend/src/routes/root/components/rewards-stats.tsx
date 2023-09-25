import { FiPackage, FiBarChart, FiClock } from "react-icons/fi";
import { useEffect } from "react";

import { useValidatorQuery } from "../../../hooks/useValidator";

import { useRewardsStatsQuery } from "../hooks/useRewardsStats";

export function RewardsStats({
  validatorIndexOrPubKey,
}: {
  validatorIndexOrPubKey: string;
}) {
  const validatorQuery = useValidatorQuery(validatorIndexOrPubKey);
  const rewardsStatsQuery = useRewardsStatsQuery(validatorIndexOrPubKey);

  useEffect(() => {
    if (
      validatorIndexOrPubKey &&
      validatorQuery.isSuccess &&
      rewardsStatsQuery.isSuccess
    ) {
      const statsElement = document.getElementById("rewards-stats");
      if (statsElement) {
        statsElement.scrollIntoView({ behavior: "smooth" });
      }
    } else if (
      validatorIndexOrPubKey &&
      validatorQuery.isLoading &&
      rewardsStatsQuery.isLoading
    ) {
      const loadingElement = document.getElementById("loading");
      if (loadingElement) {
        loadingElement.scrollIntoView({ behavior: "smooth" });
      }
    } else if (
      validatorIndexOrPubKey &&
      validatorQuery.isError &&
      rewardsStatsQuery.isError
    ) {
      const errorElement = document.getElementById("error");
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [
    validatorQuery.isSuccess,
    rewardsStatsQuery.isSuccess,
    validatorQuery.isLoading,
    rewardsStatsQuery.isLoading,
    validatorQuery.isError,
    rewardsStatsQuery.isError,
    validatorIndexOrPubKey,
  ]);

  if (validatorQuery.isLoading || rewardsStatsQuery.isLoading) {
    return (
      <div id="loading">
        <span className="loading loading-infinity loading-lg"></span>
      </div>
    );
  }

  if (validatorQuery.isError || rewardsStatsQuery.isError) {
    return (
      <div id="error">
        <div>Something went wrong!</div>
        <div>{String(validatorQuery.error || rewardsStatsQuery.error)}</div>
      </div>
    );
  }

  const { data: validator } = validatorQuery;
  const { data: rewardsStats } = rewardsStatsQuery;

  return (
    <div className="flex flex-col max-w-2xl" id="rewards-stats">
      <div className="flex flex-col items-center mb-4">
        <div className="text-center text-xl font-semibold">
          Validator #{validator.validatorindex}
        </div>
        <div className="text-sm">{`${validator.pubkey.slice(
          0,
          27
        )}...${validator.pubkey.slice(-24)}`}</div>
      </div>
      <div className="stats">
        <div className="stat">
          <div className="stat-title">You have earned</div>
          <div className="stat-value">Ξ{rewardsStats.earned}</div>
          <div className="stat-desc whitespace-normal">MEV rewards</div>
        </div>
        <div className="stat bg-primary text-primary-content">
          <div className="stat-title">You could have earned</div>
          <div className="stat-value">Ξ{rewardsStats.couldHaveEarned}</div>
          <div className="stat-desc whitespace-normal">
            MEV rewards with SMD
          </div>
        </div>
      </div>
      <div className="stats">
        <div className="stat">
          <div className="stat-figure text-secondary">
            <FiPackage className="inline-block w-8 h-8 stroke-current" />
          </div>
          <div className="stat-title">You proposed</div>
          <div className="stat-value">{rewardsStats.blocksProposed}</div>
          <div className="stat-desc">blocks in total</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-secondary">
            <FiBarChart className="inline-block w-8 h-8 stroke-current" />
          </div>
          <div className="stat-title">On avg. every</div>
          <div className="stat-value">
            {rewardsStats.avgDaysBetweenProposals}
          </div>
          <div className="stat-desc">days</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-secondary">
            <FiClock className="inline-block w-8 h-8 stroke-current" />
          </div>
          <div className="stat-title">Exp. prop. in</div>
          <div className="stat-value">{rewardsStats.expectedProposalIn}</div>
          <div className="stat-desc">days</div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="my-8 text-center">
          You could have earned <span className="font-bold">Ξ0.3</span> more ETH
          with your validator by joining the daddy's MEV smoothing pool. Let
          daddy smoothen your rewards!
        </div>
        <button className="btn">Yes, daddy</button>
      </div>
    </div>
  );
}
