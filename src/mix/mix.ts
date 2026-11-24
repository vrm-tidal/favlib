import { imageUrl } from "../internal/api";

export interface MixImage {
	url: string;
	width: number;
	height: number;
}

export interface MixImages {
	small: MixImage | null;
	medium: MixImage | null;
	large: MixImage | null;
}

export interface MixArtist {
	id: string;
	name: string;
	pictureId: string | null;
	pictureUrl: string | null;
	vibrantColor: string | null;
}

export interface Mix {
	id: string;
	type: string;
	date: string;
	title: string;
	titleColor: string | null;
	subtitle: string;
	subtitleColor: string | null;
	shortSubtitle: string | null;
	shortSubtitleColor: string | null;
	description: string | null;
	descriptionColor: string | null;
	images: MixImages;
	detailImages: MixImages;
	sharingImages: Record<string, MixImages>;
	artists: MixArtist[];
	topArtists: MixArtist[];
	updated: number;
	following: boolean;
	sortType: string | null;
	contentBehavior: string | null;
	countryCode: string | null;
	stableId: boolean;
	artifactIdType: string | null;
	userId: string | null;
	url: string;
}

type ImageResponse = MixImage & { size: string };

interface TextResponse {
	text: string | null;
	color: string | null;
}

interface MixArtistResponse {
	artistId: string | number;
	artistName: string;
	artistImage?: {
		imageUuid: string | null;
		vibrantColor: string | null;
	} | null;
}

export interface MixItemResponse {
	following?: boolean | null;
	data: {
		id: string;
		type: string;
		mixDate: string;
		titleTextInfo?: TextResponse | null;
		subtitleTextInfo?: TextResponse | null;
		shortSubtitleTextInfo?: TextResponse | null;
		description?: TextResponse | null;
		mixImages?: ImageResponse[] | null;
		detailMixImages?: ImageResponse[] | null;
		sharingImages?: Record<string, ImageResponse[]> | null;
		artists?: MixArtistResponse[] | null;
		userTopArtists?: MixArtistResponse[] | null;
		updated: number;
		sortType?: string | null;
		contentBehavior?: string | null;
		countryCode?: string | null;
		isStableId?: boolean | null;
		artifactIdType?: string | null;
		userId?: string | number | null;
	};
}

const toImages = (images: ImageResponse[] | null | undefined): MixImages => {
	const bySize = (size: string): MixImage | null => {
		const image = images?.find((entry) => entry.size === size);
		if (!image) return null;
		return { url: image.url, width: image.width, height: image.height };
	};
	return {
		small: bySize("SMALL"),
		medium: bySize("MEDIUM"),
		large: bySize("LARGE"),
	};
};

const toArtist = (artist: MixArtistResponse): MixArtist => {
	const pictureId = artist.artistImage?.imageUuid ?? null;
	return {
		id: String(artist.artistId),
		name: artist.artistName,
		pictureId,
		pictureUrl: imageUrl(pictureId, 750),
		vibrantColor: artist.artistImage?.vibrantColor ?? null,
	};
};

export const toMix = (item: MixItemResponse): Mix => {
	const { data } = item;
	return {
		id: data.id,
		type: data.type,
		date: data.mixDate,
		title: data.titleTextInfo?.text ?? "",
		titleColor: data.titleTextInfo?.color ?? null,
		subtitle: data.subtitleTextInfo?.text ?? "",
		subtitleColor: data.subtitleTextInfo?.color ?? null,
		shortSubtitle: data.shortSubtitleTextInfo?.text ?? null,
		shortSubtitleColor: data.shortSubtitleTextInfo?.color ?? null,
		description: data.description?.text ?? null,
		descriptionColor: data.description?.color ?? null,
		images: toImages(data.mixImages),
		detailImages: toImages(data.detailMixImages),
		sharingImages: Object.fromEntries(
			Object.entries(data.sharingImages ?? {}).map(([key, images]) => [
				key,
				toImages(images),
			]),
		),
		artists: (data.artists ?? []).map(toArtist),
		topArtists: (data.userTopArtists ?? []).map(toArtist),
		updated: data.updated,
		following: item.following === true,
		sortType: data.sortType ?? null,
		contentBehavior: data.contentBehavior ?? null,
		countryCode: data.countryCode ?? null,
		stableId: data.isStableId === true,
		artifactIdType: data.artifactIdType ?? null,
		userId: data.userId ? String(data.userId) : null,
		url: `https://tidal.com/browse/mix/${data.id}`,
	};
};
