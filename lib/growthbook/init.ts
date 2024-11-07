import { GrowthBook } from '@growthbook/growthbook-react';

import config from 'configs/app';

import { STORAGE_KEY, STORAGE_LIMIT } from './consts';

export interface GrowthBookFeatures {
  test_value: string;
}

export const growthBook = (() => {
  const feature = config.features.growthBook;

  if (!feature.isEnabled) {
    return;
  }

  return new GrowthBook<GrowthBookFeatures>({
    apiHost: 'https://cdn.growthbook.io',
    clientKey: feature.clientKey,
    enableDevMode: config.app.isDev,
    attributes: {
       id: "default-client-id",// You can set a different identifier if needed
      chain_id: config.chain.id,
    },
    trackingCallback: (experiment, result) => {
      if (isExperimentStarted(experiment.key)) {
        return;
      }

      saveExperimentInStorage(experiment.key);
      // You can replace the mixpanel tracking with another method or logging if needed.
      console.log('Experiment Started:', {
        'Experiment name': experiment.key,
        'Variant name': result.value,
        Source: 'growthbook',
      });
    },
  });
})();

function getStorageValue(): Array<unknown> | undefined {
  const item = window.localStorage.getItem(STORAGE_KEY);
  if (!item) {
    return;
  }

  try {
    const parsedValue = JSON.parse(item);
    if (Array.isArray(parsedValue)) {
      return parsedValue;
    }
  } catch {
    return;
  }
}

function isExperimentStarted(key: string): boolean {
  const items = getStorageValue() ?? [];
  return items.some((item) => item === key);
}

function saveExperimentInStorage(key: string) {
  const items = getStorageValue() ?? [];
  const newItems = [ key, ...items ].slice(0, STORAGE_LIMIT);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  } catch (error) {}
}
