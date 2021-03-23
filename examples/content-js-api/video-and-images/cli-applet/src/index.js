
require('./index.css');

import sos from '@signageos/front-applet';

// Wait on sos data are ready (https://docs.signageos.io/api/js/content/latest/js-applet-basics)
sos.onReady().then(async function () {
	const contentElement = document.getElementById('index');
	const imgElements = [document.getElementById('image-1'), document.getElementById('image-2')]

	function getImgElement(...args) {
		return imgElements.find((imgElement) => imgElement.getAttribute('data-args') === JSON.stringify(args)) ||
			imgElements.find((imgElement) => imgElement.style.display === 'none');
	}
	
	const contents = sos.config.contents ? JSON.parse(sos.config.contents) : [{
			uid: 'video-1.mp4',
			uri: 'https://static.signageos.io/assets/video-test-1_e07fc21a7a72e3d33478243bd75d7743.mp4'
		},
		{
			uid: 'image-1.png',
			uri: 'https://static.signageos.io/assets/android-benq-amy_bbd9afbc0655ceb6da790a80fbd90290.png'
		},
		{
			uid: 'image-2.png',
			uri: 'https://static.signageos.io/assets/android-nec-roberto_3f9b985e2214b59e3d1f296e69e86fdd.png'
		},
		{
			uid: 'image-3.png',
			uri: 'https://static.signageos.io/assets/android-panasonic-pikachu_347af960f123f7c56f5f967882108bdf.png'
		},
		{
			uid: 'image-4.png',
			uri: 'https://static.signageos.io/assets/brightsign-4.7-nelson_9fed77987aac013a712eed87adbcf0d9.png'
		},
		{
			uid: 'image-5.png',
			uri: 'https://static.signageos.io/assets/chrome-os-krusty_99c97ad4680ccf06517b220b61327a5c.png'
		},
		{
			uid: 'video-2.mp4',
			uri: 'https://static.signageos.io/assets/video-test-2_e2ffa51f6a4473b815f39e7fb39239da.mp4'
		},
		{
			uid: 'image-6.png',
			uri: 'https://static.signageos.io/assets/sssp-2.0-burns_2a17095aec4332358d91b47999862647.png'
		},
		{
			uid: 'image-7.png',
			uri: 'https://static.signageos.io/assets/sssp-3.0-maggie_47dfc4c8c21b49c5d6f0ef1505ece49c.png'
		},
		{
			uid: 'image-8',
			uri: 'https://static.signageos.io/assets/tizen-2.4-bart_96c02fbd2df936e8bdd0b345f8874224.png'
		},
		{
			uid: 'image-9.png',
			uri: 'https://static.signageos.io/assets/tizen-3.0-apu_e300ee67c93b616ee36f51202234d429.png'
		},
		{
			uid: 'video-3.mp4',
			uri: 'https://static.signageos.io/assets/video-test-3_5cfd717df750e5b1d5dd8384c194a92d.mp4'
		},
		{
			uid: 'image-10.png,
			uri: 'https://static.signageos.io/assets/webos-1.0-krabappel_60b520b38756789dce877dc2feac92fb.png'
		},
		{
			uid: 'image-11.png',
			uri: 'https://static.signageos.io/assets/webos-2.0-farnsworth_413fc194707fdeb82052b3e2541fb50a.png'
		},
		{
			uid: 'image-12.png',
			uri: 'https://static.signageos.io/assets/webos-3.0-zapp_951665bdb0a145befd8cf9382c93bd77.png'
		},
		{
			uid: 'image-13.png',
			uri: 'https://static.signageos.io/assets/webos-3.2-bender_19043283cc5147bf441265fc494a0505.png'
		},
	];

	// Save all files parallel
	await Promise.all(contents.map(async (content) => {
		// Store files to offline storage (https://docs.signageos.io/api/js/content/latest/js-offline-cache-media-files)
		const {
			filePath
		} = await sos.offline.cache.loadOrSaveFile(content.uid, content.uri);
		content.filePath = filePath;
	}));

	for (const content of contents) {
		content.arguments = [content.filePath, 0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight];
	}

	contentElement.innerHTML = '';

	async function playContent(content) {
		if (content.uid.indexOf('video-') === 0) {
			await sos.video.play(...content.arguments);
		}
		if (content.uid.indexOf('image-') === 0) {
			getImgElement(...content.arguments).style.display = 'block';
		}
		content.playing = true;
	}

	async function stopContent(content) {
		if (content.playing) {
			if (content.uid.indexOf('video-') === 0) {
				await sos.video.stop(...content.arguments);
			}
			if (content.uid.indexOf('image-') === 0) {
				const imgElement = getImgElement(...content.arguments);
				imgElement.src = '';
				imgElement.setAttribute('data-args', '');
				imgElement.style.display = 'none';
			}
			content.playing = false;
		}
	}

	async function prepareContent(content) {
		if (content.uid.indexOf('video-') === 0) {
			await sos.video.prepare(...content.arguments);
		}
		if (content.uid.indexOf('image-') === 0) {
			const imgElement = getImgElement(...content.arguments);
			imgElement.src = content.filePath;
			imgElement.setAttribute('data-args', JSON.stringify(content.arguments));
		}
	}

	async function waitEndedContent(content) {
		if (content.uid.indexOf('video-') === 0) {
			await sos.video.onceEnded(...content.arguments);
		}
		if (content.uid.indexOf('image-') === 0) {
			await new Promise((resolve) => setTimeout(resolve, 3e3));
		}
	}

	await prepareContent(contents[0]);

	for (let i = 0; true; i = (i + 1) % contents.length) {
		const previousContent = contents[(i + contents.length - 1) % contents.length];
		const currentContent = contents[i];
		const nextContent = contents[(i + 1) % contents.length];

		await playContent(currentContent);
		await stopContent(previousContent);
		await prepareContent(nextContent);
		await waitEndedContent(currentContent);
	}

});
