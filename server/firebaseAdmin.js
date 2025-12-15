
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// Try to initialize Firebase Admin in multiple ways (local dev or CI):
// 1) If SERVICE_ACCOUNT_PATH env var is set and file exists, load that JSON file.
// 2) If FIREBASE_PRIVATE_KEY + FIREBASE_CLIENT_EMAIL + FIREBASE_PROJECT_ID are set, construct a service account object.
// 3) Otherwise fall back to default initialization (ADC) but log actionable guidance.

function initFirebaseAdmin() {
	// 1) service account JSON file
	const saPath = process.env.SERVICE_ACCOUNT_PATH;
	if (saPath) {
		const resolved = path.isAbsolute(saPath) ? saPath : path.join(__dirname, saPath);
		if (fs.existsSync(resolved)) {
			const serviceAccount = require(resolved);
			admin.initializeApp({
				credential: admin.credential.cert(serviceAccount),
			});
			console.log('✅ Firebase Admin initialized using service account file:', resolved);
			return;
		} else {
			console.warn('SERVICE_ACCOUNT_PATH provided but file not found:', resolved);
		}
	}

	// 2) env vars for service account
	const { FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID } = process.env;
	if (FIREBASE_PRIVATE_KEY && FIREBASE_CLIENT_EMAIL && FIREBASE_PROJECT_ID) {
		// PRIVATE_KEY may have escaped newlines (\n) in env; convert them
		const privateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
		const serviceAccount = {
			type: 'service_account',
			project_id: FIREBASE_PROJECT_ID,
			private_key: privateKey,
			client_email: FIREBASE_CLIENT_EMAIL,
		};
		try {
			admin.initializeApp({
				credential: admin.credential.cert(serviceAccount),
				projectId: FIREBASE_PROJECT_ID,
			});
			console.log('✅ Firebase Admin initialized using service account from environment variables');
			return;
		} catch (err) {
			console.error('Failed to initialize Firebase Admin from env service account:', err.message);
		}
	}

	// 3) Default (ADC) - may throw if not configured
	try {
		const fallbackProjectId = process.env.FIREBASE_PROJECT_ID;
		admin.initializeApp(
			fallbackProjectId
				? { projectId: fallbackProjectId }
				: undefined
		);
		console.log('✅ Firebase Admin initialized using Application Default Credentials');
	} catch (err) {
		console.error('Unable to initialize Firebase Admin automatically:', err.message);
		console.error('Local dev tip: set SERVICE_ACCOUNT_PATH to your service account JSON, or set FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID env vars.');
	}
}

initFirebaseAdmin();

module.exports = admin;
