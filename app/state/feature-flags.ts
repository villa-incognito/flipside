import { BehaviorSubject } from "rxjs";
import { useSubscription } from "~/hooks/useSubscription";

type FeatureFlag = "livequery-integrations";
export const featureFlags$$ = new BehaviorSubject<Record<FeatureFlag, string | boolean>>({
  "livequery-integrations": false,
});

export const useAllFeatureFlags = () => {
  const flags = useSubscription(featureFlags$$);
  return flags;
};

export const useFeatureFlag = (string: FeatureFlag) => {
  const flags = useAllFeatureFlags();
  return flags[string] ?? false;
};
