import { redux } from "@luna/lib";

import { API_V2, request } from "../internal/api";
import { type Mix, type MixItemResponse, toMix } from "./mix";

export interface YearlyMix extends Mix {
	year: number;
}

export interface MonthlyMix extends Mix {
	year: number;
	month: number;
}

export interface Mixes {
	allTime: Mix | null;
	yearly: YearlyMix[];
	monthly: MonthlyMix[];
}

interface HistoryMixesResponse {
	items?: MixItemResponse[] | null;
}

const LIMIT = 50;

const getHistoryMixes = async (): Promise<Mix[]> => {
	const { session, settings } = redux.store.getState();
	const items: MixItemResponse[] = [];
	let page: MixItemResponse[] = [];
	do {
		const params = new URLSearchParams({
			countryCode: session.countryCode,
			locale: settings.language || navigator.language,
			deviceType: "DESKTOP",
			platform: "DESKTOP",
			limit: String(LIMIT),
			offset: String(items.length),
		});
		const res = await request(
			`${API_V2}/home/pages/HISTORY_MIXES/view-all?${params}`,
		);
		const response: HistoryMixesResponse = await res.json();
		page = response.items ?? [];
		items.push(...page);
	} while (page.length === LIMIT);
	return items.map(toMix);
};

export const getMixes = async (): Promise<Mixes> => {
	const mixes: Mixes = { allTime: null, yearly: [], monthly: [] };
	for (const mix of await getHistoryMixes()) {
		// "alltime", yyyy or yyyy-MM
		const [year, month] = mix.date.split("-").map(Number);
		switch (mix.type) {
			case "HISTORY_ALLTIME_MIX":
				mixes.allTime = mix;
				break;
			case "HISTORY_YEARLY_MIX":
				mixes.yearly.push({ ...mix, year });
				break;
			case "HISTORY_MONTHLY_MIX":
				mixes.monthly.push({ ...mix, year, month });
				break;
		}
	}
	mixes.yearly.sort((a, b) => b.year - a.year);
	mixes.monthly.sort((a, b) => b.year - a.year || b.month - a.month);
	return mixes;
};
