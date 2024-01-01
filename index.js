const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000; // Ganti dengan port yang kamu inginkan

app.use(express.json());


async function getInfo(videoUrl) {
	try {
		const analyzeResponse = await axios.post(
			'https://www.y2mate.com/mates/en872/analyzeV2/ajax',
			'k_query=' + encodeURIComponent(videoUrl) + '&k_page=home&hl=en&q_auto=0', {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
					Accept: '*/*',
					'User-Agent': 'Mozilla/5.0 (Linux; Android 11; M2004J19C Build/RP1A.200720.011) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.129 Mobile Safari/537.36 WhatsApp/1.2.3',
					Origin: 'https://www.y2mate.com',
					'X-Requested-With': 'XMLHttpRequest',
				},
			}
		);

		const analyzeData = analyzeResponse.data;

		if (analyzeData.status === 'ok') {
			const result = {
				status: analyzeData.status,
				vid: analyzeData.vid,
				title: analyzeData.title,
				channel: analyzeData.a,
				links_mp4: [],
				links_mp3: [],
			};

			for (const format in analyzeData.links.mp4) {
				const linkData = analyzeData.links.mp4[format];
				result.links_mp4.push({
					quality: linkData.q,
					type: linkData.f,
					id: linkData.k,
					text: linkData.q_text,
				});
			}

			for (const format in analyzeData.links.mp3) {
				const linkData = analyzeData.links.mp3[format];
				result.links_mp3.push({
					quality: linkData.q,
					type: linkData.f,
					id: linkData.k,
					text: linkData.q_text,
				});
			}

			return result;
		} else {
			return {
				status: 'error',
				mess: 'Failed to fetch video information.',
			};
		}
	} catch (error) {
		return {
			status: 'error',
			mess: 'An error occurred while fetching video information.',
			error: error,
		};
	}
}

async function getDownload(vid, preferredQualityId) {
	try {
		const convertResponse = await axios.post(
			'https://www.y2mate.com/mates/convertV2/index',
			`vid=${vid}&k=${preferredQualityId}`, {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
					Accept: '*/*',
					'User-Agent': 'Mozilla/5.0 (Linux; Android 11; M2004J19C Build/RP1A.200720.011) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.129 Mobile Safari/537.36 WhatsApp/1.2.3',
					Origin: 'https://www.y2mate.com',
					'X-Requested-With': 'XMLHttpRequest',
				},
			}
		);

		return convertResponse.data;
	} catch (error) {
		return {
			status: 'error',
			mess: 'An error occurred while fetching or converting video.',
			error: error,
		};
	}
}







app.get('/download/ytmp4', async (req, res) => {
	const {
		videoUrl
	} = req.body;

	if (!videoUrl) {
		return res.status(400).json({
			status: 'error',
			mess: 'Missing videoUrl parameter'
		});
	}

	try {
		const result = await getInfo(videoUrl);
		res.json(result);
	} catch (error) {
		res.status(500).json({
			status: 'error',
			mess: 'Internal Server Error',
			error: error.message
		});
	}
});

app.get('/download/getlink', async (req, res) => {
	const {
		videoId,
		qualityId
	} = req.body;

	if (!videoUrl) {
		return res.status(400).json({
			status: 'error',
			mess: 'Missing videoUrl parameter'
		});
	}

	try {
		const result = await getDownload(videoUrl);
		res.json(result);
	} catch (error) {
		res.status(500).json({
			status: 'error',
			mess: 'Internal Server Error',
			error: error.message
		});
	}
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
