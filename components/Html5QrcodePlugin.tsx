// src/components/Html5QrcodePlugin.jsx
import React, { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const qrcodeRegionId = "html5qr-code-full-region";

const createConfig = ({ fps, qrbox, aspectRatio, disableFlip }: {
	fps?: number;
	qrbox?: { width: number; height: number };
	aspectRatio?: number;
	disableFlip?: boolean;
}) => {
	const config: {
		fps: number;
		qrbox: { width: number; height: number };
		aspectRatio: number;
		disableFlip: boolean;
	} = {
		fps: fps || 10,
		qrbox: qrbox || { width: 250, height: 250 },
		aspectRatio: aspectRatio || 1.0,
		disableFlip: disableFlip !== undefined ? disableFlip : false,
	};
	return config;
};

export default function Html5QrcodePlugin(props: {
	fps?: number;
	qrbox?: { width: number; height: number };
	aspectRatio?: number;
	disableFlip?: boolean;
	verbose?: boolean;
	qrCodeSuccessCallback: (decodedText: string) => void;
	qrCodeErrorCallback?: (error: string) => void;
}) {
	useEffect(() => {
		if (!props.qrCodeSuccessCallback) {
			throw new Error("qrCodeSuccessCallback is required");
		}
		const config = createConfig(props);
		const verbose = props.verbose === true;
		const scanner = new Html5QrcodeScanner(qrcodeRegionId, config, verbose);

		scanner.render(
			props.qrCodeSuccessCallback,
			props.qrCodeErrorCallback || (() => {}),
		);

		return () => {
			scanner.clear().catch((err) => {
				console.error("Failed to clear html5QrcodeScanner:", err);
			});
		};
	}, [props]);

	return <div id={qrcodeRegionId} />;
}
