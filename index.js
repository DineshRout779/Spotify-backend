const app = require('express')();
const { default: fetch } = require('node-fetch');
const querystring = require('querystring');
const cors = require('cors')
require('dotenv').config();

const port = process.env.PORT || 5000;

app.use(cors({
	origin: 'https://dineshrout.netlify.app'
}))

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;
const TOP_TRACKS_ENDPOINT = `https://api.spotify.com/v1/me/top/tracks`;
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

const getAccessToken = async () => {
	try {
		const body = querystring.stringify({
			grant_type: 'refresh_token',
			refresh_token,
		});
		const headers = {
			Authorization: `Basic ${basic}`,
			'Content-Type': 'application/x-www-form-urlencoded',
		};

		const res = await fetch(TOKEN_ENDPOINT, {
			method: 'POST',
			headers: headers,
			body: body,
		});

		return await res.json();
	} catch (error) {
		console.log(error);
	}
};

const getNowPlaying = async (req, res) => {
	const { access_token } = await getAccessToken();

	return fetch(NOW_PLAYING_ENDPOINT, {
		headers: {
			Authorization: `Bearer ${access_token}`,
		},
	});
};

const getTopTracks = async (req, res) => {
	const { access_token } = await getAccessToken();

	return fetch(TOP_TRACKS_ENDPOINT, {
		headers: {
			Authorization: `Bearer ${access_token}`,
		},
	});
};

app.get('/getCurrentTrack', async (req, res) => {
	const response = await getNowPlaying();

	if (response.status === 204 || response.status > 400) {
		return res.status(200).json({ isPlaying: false });
	}

	const song = await response.json();
	const isPlaying = song.is_playing;
	const title = song.item.name;
	const artist = song.item.artists.map((_artist) => _artist.name).join(', ');
	const album = song.item.album.name;
	const albumImageUrl = song.item.album.images[0].url;
	const songUrl = song.item.external_urls.spotify;

	return res.status(200).json({
		song: {
			album,
			albumImageUrl,
			artist,
			songUrl,
			title,
		},
		isPlaying: song.is_playing,
	});
});

app.listen(port, () => {
	console.log(`server started on http://localhost:${port}`);
});
