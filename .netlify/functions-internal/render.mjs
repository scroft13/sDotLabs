import { init } from '../serverless.js';

export const handler = init({
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png","profilePic.jpeg","resume.pdf"]),
	mimeTypes: {".png":"image/png",".jpeg":"image/jpeg",".pdf":"application/pdf"},
	_: {
		entry: {"file":"_app/immutable/start-99c09e93.js","imports":["_app/immutable/start-99c09e93.js","_app/immutable/chunks/index-cf554b97.js","_app/immutable/chunks/singletons-a92c7e31.js","_app/immutable/chunks/index-42057999.js"],"stylesheets":[]},
		nodes: [
			() => import('../server/nodes/0.js'),
			() => import('../server/nodes/1.js'),
			() => import('../server/nodes/2.js')
		],
		routes: [
			{
				id: "",
				pattern: /^\/$/,
				names: [],
				types: [],
				page: { layouts: [0], errors: [1], leaf: 2 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
});
