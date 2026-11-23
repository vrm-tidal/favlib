import { imageUrl } from "../internal/api";

export interface ArtistRole {
	categoryId: number;
	category: string;
}

export interface Artist {
	id: string;
	name: string;
	pictureId: string | null;
	pictureUrl: string | null;
	pictureOriginal: string | null;
	popularity: number | null;
	doublePopularity: number | null;
	types: string[];
	roles: ArtistRole[];
	mixes: Record<string, string>;
	vibrantColor: string | null;
	albumCoverFallbackId: string | null;
	handle: string | null;
	userId: string | null;
	artworkId: string | null;
	foregroundColor: string | null;
	backgroundColor: string | null;
	bannerArtworkId: string | null;
	logoArtworkId: string | null;
	spotlighted: boolean;
	contributionsEnabled: boolean;
	cashAppOnboarded: boolean;
	ownerType: string | null;
	url: string;
}

type Id = string | number | null;

export interface ArtistResponse {
	id: string | number;
	name: string;
	picture: string | null;
	popularity: number | null;
	doublePopularity: number | null;
	artistTypes?: string[] | null;
	artistRoles?: ArtistRole[] | null;
	mixes?: Record<string, string> | null;
	vibrantColor: string | null;
	selectedAlbumCoverFallback: string | null;
	handle: string | null;
	userId: Id;
	artworkId: Id;
	foregroundColor: string | null;
	backgroundColor: string | null;
	bannerArtworkId: Id;
	logoArtworkId: Id;
	spotlighted?: boolean | null;
	contributionsEnabled?: boolean | null;
	cashAppOnboarded?: boolean | null;
	ownerType: string | null;
}

const idOf = (id: Id) => {
	if (!id) return null;
	return String(id);
};

export const toArtist = (artist: ArtistResponse): Artist => {
	const picture = artist.picture || artist.selectedAlbumCoverFallback;
	return {
		id: String(artist.id),
		name: artist.name,
		pictureId: artist.picture,
		pictureUrl: imageUrl(picture, artist.picture ? 750 : 1280),
		pictureOriginal: imageUrl(picture, "origin"),
		popularity: artist.popularity,
		doublePopularity: artist.doublePopularity,
		types: artist.artistTypes ?? [],
		roles: artist.artistRoles ?? [],
		mixes: artist.mixes ?? {},
		vibrantColor: artist.vibrantColor,
		albumCoverFallbackId: artist.selectedAlbumCoverFallback,
		handle: artist.handle,
		userId: idOf(artist.userId),
		artworkId: idOf(artist.artworkId),
		foregroundColor: artist.foregroundColor,
		backgroundColor: artist.backgroundColor,
		bannerArtworkId: idOf(artist.bannerArtworkId),
		logoArtworkId: idOf(artist.logoArtworkId),
		spotlighted: artist.spotlighted === true,
		contributionsEnabled: artist.contributionsEnabled === true,
		cashAppOnboarded: artist.cashAppOnboarded === true,
		ownerType: artist.ownerType,
		url: `https://tidal.com/browse/artist/${artist.id}`,
	};
};
