import { TidalApi } from "@luna/lib";

export const API_V2 = "https://api.tidal.com/v2";

const clientVersion = () => {
	const now = new Date();
	return `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}`;
};

export const request = async (url: string) => {
	const res = await fetch(url, {
		cache: "no-store",
		headers: {
			...(await TidalApi.getAuthHeaders()),
			"x-tidal-client-version": clientVersion(),
		},
	});
	if (!res.ok) throw new Error(`${res.status} ${res.statusText} (${url})`);
	return res;
};

export const imageUrl = (uuid: string | null, size: number | "origin") => {
	if (!uuid) return null;
	const file = size === "origin" ? "origin" : `${size}x${size}`;
	return `https://resources.tidal.com/images/${uuid.replaceAll("-", "/")}/${file}.jpg`;
};
