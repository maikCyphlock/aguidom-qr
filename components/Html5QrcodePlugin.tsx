// src/components/Html5QrcodePlugin.jsx
import React, { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const qrcodeRegionId = "html5qr-code-full-region";

const createConfig = ({ fps, qrbox, aspectRatio, disableFlip }) => {
	const config = {};
	if (fps) config.fps = fps;
	if (qrbox) config.qrbox = qrbox;
	if (aspectRatio) config.aspectRatio = aspectRatio;
	if (disableFlip !== undefined) config.disableFlip = disableFlip;
	return config;
};

export default function Html5QrcodePlugin(props) {
	useEffect(() => {
		if (!props.qrCodeSuccessCallback) {
			throw new Error("qrCodeSuccessCallback is required");
		}
		const config = createConfig(props);
		const verbose = props.verbose === true;
		const scanner = new Html5QrcodeScanner(qrcodeRegionId, config, verbose);

		scanner.render(
			props.qrCodeSuccessCallback,
			props.qrCodeErrorCallback || ((_) => {}),
		);

		return () => {
			scanner.clear().catch((err) => {
				console.error("Failed to clear html5QrcodeScanner:", err);
			});
		};
	}, [
		props.fps,
		props.qrbox,
		props.aspectRatio,
		props.disableFlip,
		props.verbose,
		props.qrCodeSuccessCallback,
		props.qrCodeErrorCallback,
	]);

	return <div id={qrcodeRegionId} />;
}
