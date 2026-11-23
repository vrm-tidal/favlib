import { redux } from "@luna/lib";

import { API_V2, request } from "../internal/api";
import { type Artist, type ArtistResponse, toArtist } from "./artist";

export interface Month {
	year: number;
	month: number;
	title: string;
}

export interface StreamedArtist {
	artist: Artist;
	streams: number;
}

export interface Banners {
	default: string | null;
	landscape: string | null;
	portrait: string | null;
}

export interface Disclaimer {
	text: string;
	url: string;
}

export interface ActivitySummary {
	artists: { id: string; name: string; streams: number }[];
	daysLeft: number | null;
	type: string | null;
	title: string | null;
	subtitle: string | null;
}

export interface MonthlyTopArtists {
	year: number;
	month: number;
	title: string | null;
	banners: Banners;
	summary: ActivitySummary;
	artists: StreamedArtist[];
	totalStreams: number | null;
	disclaimers: Disclaimer[];
}

export interface AllMonthlyTopArtists {
	timeline: Month[];
	months: MonthlyTopArtists[];
}

interface TimelineResponse {
	timeline?: Month[] | null;
}

interface TopArtistsResponse {
	activity?: {
		images?: { id: string; url: string }[] | null;
		artists?:
			| { id: string | number; name: string; nrOfStreams: number }[]
			| null;
		nrOfDaysLeft?: number;
		activityType?: string;
		title?: string;
		subtitle?: string;
	} | null;
	artists?: { artist: ArtistResponse; nrOfStreams: number }[] | null;
	totalNrOfStreams?: number;
	metadata?: { timeline?: Month[] | null } | null;
	disclaimers?: Disclaimer[] | null;
}

export const getTimeline = async (): Promise<Month[]> => {
	const locale = redux.store.getState().settings.language || navigator.language;
	const params = new URLSearchParams({ locale });
	const res = await request(`${API_V2}/my-activity/timeline?${params}`);
	const response: TimelineResponse = await res.json();
	return response.timeline ?? [];
};

export const getMonthlyTopArtists = async (
	year: number,
	month: number,
): Promise<MonthlyTopArtists> => {
	const locale = redux.store.getState().settings.language || navigator.language;
	const params = new URLSearchParams({
		locale,
		year: String(year),
		month: String(month),
	});
	const res = await request(`${API_V2}/my-activity/top-artists?${params}`);
	const result: TopArtistsResponse = await res.json();
	const summary = result.activity;
	const images = summary?.images ?? [];
	const imageOf = (id: string) => {
		return images.find((image) => image.id === id)?.url ?? null;
	};
	const timeline = result.metadata?.timeline ?? [];
	return {
		year,
		month,
		title:
			timeline.find((entry) => entry.year === year && entry.month === month)
				?.title ?? null,
		banners: {
			default: imageOf("DEFAULT"),
			landscape: imageOf("LANDSCAPE"),
			portrait: imageOf("PORTRAIT"),
		},
		summary: {
			artists: (summary?.artists ?? []).map(({ id, name, nrOfStreams }) => ({
				id: String(id),
				name,
				streams: nrOfStreams,
			})),
			daysLeft: summary?.nrOfDaysLeft ?? null,
			type: summary?.activityType ?? null,
			title: summary?.title ?? null,
			subtitle: summary?.subtitle ?? null,
		},
		artists: (result.artists ?? []).map(({ artist, nrOfStreams }) => ({
			artist: toArtist(artist),
			streams: nrOfStreams,
		})),
		totalStreams: result.totalNrOfStreams ?? null,
		disclaimers: result.disclaimers ?? [],
	};
};

export const getAllMonthlyTopArtists =
	async (): Promise<AllMonthlyTopArtists> => {
		const timeline = await getTimeline();
		const months = await Promise.all(
			timeline.map(({ year, month }) => getMonthlyTopArtists(year, month)),
		);
		return { timeline, months };
	};

export const getAllTimeMonthlyTopArtists = async (
	timeline?: Month[],
): Promise<StreamedArtist[]> => {
	const months = timeline ?? (await getTimeline());
	const results = await Promise.all(
		months.map(({ year, month }) => getMonthlyTopArtists(year, month)),
	);
	const totals = new Map<string, StreamedArtist>();
	for (const { artists } of results) {
		for (const { artist, streams } of artists) {
			const total = totals.get(artist.id);
			if (total) total.streams += streams;
			else totals.set(artist.id, { artist, streams });
		}
	}
	return [...totals.values()].sort((a, b) => b.streams - a.streams);
};
