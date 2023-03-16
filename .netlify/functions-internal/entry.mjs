import * as adapter from '@astrojs/netlify/netlify-functions.js';
import React, { createElement } from 'react';
import ReactDOM from 'react-dom/server';
import { g as server_default, h as deserializeManifest } from './chunks/astro.aaa6c455.mjs';
import { _ as _page0, a as _page1, b as _page2, c as _page3, d as _page4, e as _page5, f as _page6, g as _page7, h as _page8, i as _page9, j as _page10, k as _page11, l as _page12, m as _page13 } from './chunks/pages/all.1bb997cd.mjs';
import 'mime';
import 'cookie';
import 'kleur/colors';
import 'slash';
import 'path-to-regexp';
import 'html-escaper';
import 'string-width';
import 'image-size';
import 'node:fs/promises';
import 'node:url';
import 'svgo';
/* empty css                                  */import '@fortawesome/free-solid-svg-icons';
import '@fortawesome/react-fontawesome';
/* empty css                                    */import 'react/jsx-runtime';

/**
 * Astro passes `children` as a string of HTML, so we need
 * a wrapper `div` to render that content as VNodes.
 *
 * As a bonus, we can signal to React that this subtree is
 * entirely static and will never change via `shouldComponentUpdate`.
 */
const StaticHtml = ({ value, name }) => {
	if (!value) return null;
	return createElement('astro-slot', {
		name,
		suppressHydrationWarning: true,
		dangerouslySetInnerHTML: { __html: value },
	});
};

/**
 * This tells React to opt-out of re-rendering this subtree,
 * In addition to being a performance optimization,
 * this also allows other frameworks to attach to `children`.
 *
 * See https://preactjs.com/guide/v8/external-dom-mutations
 */
StaticHtml.shouldComponentUpdate = () => false;

const slotName = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
const reactTypeof = Symbol.for('react.element');

function errorIsComingFromPreactComponent(err) {
	return (
		err.message &&
		(err.message.startsWith("Cannot read property '__H'") ||
			err.message.includes("(reading '__H')"))
	);
}

async function check(Component, props, children) {
	// Note: there are packages that do some unholy things to create "components".
	// Checking the $$typeof property catches most of these patterns.
	if (typeof Component === 'object') {
		const $$typeof = Component['$$typeof'];
		return $$typeof && $$typeof.toString().slice('Symbol('.length).startsWith('react');
	}
	if (typeof Component !== 'function') return false;

	if (Component.prototype != null && typeof Component.prototype.render === 'function') {
		return React.Component.isPrototypeOf(Component) || React.PureComponent.isPrototypeOf(Component);
	}

	let error = null;
	let isReactComponent = false;
	function Tester(...args) {
		try {
			const vnode = Component(...args);
			if (vnode && vnode['$$typeof'] === reactTypeof) {
				isReactComponent = true;
			}
		} catch (err) {
			if (!errorIsComingFromPreactComponent(err)) {
				error = err;
			}
		}

		return React.createElement('div');
	}

	await renderToStaticMarkup(Tester, props, children, {});

	if (error) {
		throw error;
	}
	return isReactComponent;
}

async function getNodeWritable() {
	let nodeStreamBuiltinModuleName = 'stream';
	let { Writable } = await import(/* @vite-ignore */ nodeStreamBuiltinModuleName);
	return Writable;
}

async function renderToStaticMarkup(Component, props, { default: children, ...slotted }, metadata) {
	delete props['class'];
	const slots = {};
	for (const [key, value] of Object.entries(slotted)) {
		const name = slotName(key);
		slots[name] = React.createElement(StaticHtml, { value, name });
	}
	// Note: create newProps to avoid mutating `props` before they are serialized
	const newProps = {
		...props,
		...slots,
	};
	const newChildren = children ?? props.children;
	if (newChildren != null) {
		newProps.children = React.createElement(StaticHtml, { value: newChildren });
	}
	const vnode = React.createElement(Component, newProps);
	let html;
	if (metadata && metadata.hydrate) {
		if ('renderToReadableStream' in ReactDOM) {
			html = await renderToReadableStreamAsync(vnode);
		} else {
			html = await renderToPipeableStreamAsync(vnode);
		}
	} else {
		if ('renderToReadableStream' in ReactDOM) {
			html = await renderToReadableStreamAsync(vnode);
		} else {
			html = await renderToStaticNodeStreamAsync(vnode);
		}
	}
	return { html };
}

async function renderToPipeableStreamAsync(vnode) {
	const Writable = await getNodeWritable();
	let html = '';
	return new Promise((resolve, reject) => {
		let error = undefined;
		let stream = ReactDOM.renderToPipeableStream(vnode, {
			onError(err) {
				error = err;
				reject(error);
			},
			onAllReady() {
				stream.pipe(
					new Writable({
						write(chunk, _encoding, callback) {
							html += chunk.toString('utf-8');
							callback();
						},
						destroy() {
							resolve(html);
						},
					})
				);
			},
		});
	});
}

async function renderToStaticNodeStreamAsync(vnode) {
	const Writable = await getNodeWritable();
	let html = '';
	return new Promise((resolve, reject) => {
		let stream = ReactDOM.renderToStaticNodeStream(vnode);
		stream.on('error', (err) => {
			reject(err);
		});
		stream.pipe(
			new Writable({
				write(chunk, _encoding, callback) {
					html += chunk.toString('utf-8');
					callback();
				},
				destroy() {
					resolve(html);
				},
			})
		);
	});
}

/**
 * Use a while loop instead of "for await" due to cloudflare and Vercel Edge issues
 * See https://github.com/facebook/react/issues/24169
 */
async function readResult(stream) {
	const reader = stream.getReader();
	let result = '';
	const decoder = new TextDecoder('utf-8');
	while (true) {
		const { done, value } = await reader.read();
		if (done) {
			if (value) {
				result += decoder.decode(value);
			} else {
				// This closes the decoder
				decoder.decode(new Uint8Array());
			}

			return result;
		}
		result += decoder.decode(value, { stream: true });
	}
}

async function renderToReadableStreamAsync(vnode) {
	return await readResult(await ReactDOM.renderToReadableStream(vnode));
}

const _renderer1 = {
	check,
	renderToStaticMarkup,
};

const pageMap = new Map([["node_modules/@astrojs/image/dist/endpoint.js", _page0],["src/pages/index.astro", _page1],["src/pages/discovery-to-impact.astro", _page2],["src/pages/name-image-likeness.astro", _page3],["src/pages/burnt-orange-bash.astro", _page4],["src/pages/fireside-chat.astro", _page5],["src/pages/sessions-edu.astro", _page6],["src/pages/networking.astro", _page7],["src/pages/404-test.astro", _page8],["src/pages/sessions.astro", _page9],["src/pages/my-kutx.astro", _page10],["src/pages/index2.astro", _page11],["src/pages/404.astro", _page12],["src/pages/[slug].astro", _page13],]);
const renderers = [Object.assign({"name":"astro:jsx","serverEntrypoint":"astro/jsx/server.js","jsxImportSource":"astro"}, { ssr: server_default }),Object.assign({"name":"@astrojs/react","clientEntrypoint":"@astrojs/react/client.js","serverEntrypoint":"@astrojs/react/server.js","jsxImportSource":"react"}, { ssr: _renderer1 }),];

const _manifest = Object.assign(deserializeManifest({"adapterName":"@astrojs/netlify/functions","routes":[{"file":"","links":[],"scripts":[],"routeData":{"type":"endpoint","route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/@astrojs/image/dist/endpoint.js","pathname":"/_image","prerender":false,"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["_astro/404-test.f9075e7f.css"],"scripts":[{"type":"external","value":"_astro/hoisted.7f524736.js"}],"routeData":{"route":"/","type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["_astro/404-test.f9075e7f.css"],"scripts":[{"type":"external","value":"_astro/hoisted.7f524736.js"}],"routeData":{"route":"/discovery-to-impact","type":"page","pattern":"^\\/discovery-to-impact\\/?$","segments":[[{"content":"discovery-to-impact","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/discovery-to-impact.astro","pathname":"/discovery-to-impact","prerender":false,"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["_astro/404-test.f9075e7f.css"],"scripts":[{"type":"external","value":"_astro/hoisted.7f524736.js"}],"routeData":{"route":"/name-image-likeness","type":"page","pattern":"^\\/name-image-likeness\\/?$","segments":[[{"content":"name-image-likeness","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/name-image-likeness.astro","pathname":"/name-image-likeness","prerender":false,"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["_astro/404-test.f9075e7f.css"],"scripts":[{"type":"external","value":"_astro/hoisted.7f524736.js"}],"routeData":{"route":"/burnt-orange-bash","type":"page","pattern":"^\\/burnt-orange-bash\\/?$","segments":[[{"content":"burnt-orange-bash","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/burnt-orange-bash.astro","pathname":"/burnt-orange-bash","prerender":false,"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["_astro/404-test.f9075e7f.css"],"scripts":[{"type":"external","value":"_astro/hoisted.7f524736.js"}],"routeData":{"route":"/fireside-chat","type":"page","pattern":"^\\/fireside-chat\\/?$","segments":[[{"content":"fireside-chat","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/fireside-chat.astro","pathname":"/fireside-chat","prerender":false,"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["_astro/404-test.f9075e7f.css"],"scripts":[{"type":"external","value":"_astro/hoisted.7f524736.js"}],"routeData":{"route":"/sessions-edu","type":"page","pattern":"^\\/sessions-edu\\/?$","segments":[[{"content":"sessions-edu","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/sessions-edu.astro","pathname":"/sessions-edu","prerender":false,"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["_astro/404-test.f9075e7f.css"],"scripts":[{"type":"external","value":"_astro/hoisted.79229368.js"}],"routeData":{"route":"/networking","type":"page","pattern":"^\\/networking\\/?$","segments":[[{"content":"networking","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/networking.astro","pathname":"/networking","prerender":false,"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["_astro/404-test.f9075e7f.css"],"scripts":[{"type":"external","value":"_astro/hoisted.7f524736.js"}],"routeData":{"route":"/404-test","type":"page","pattern":"^\\/404-test\\/?$","segments":[[{"content":"404-test","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/404-test.astro","pathname":"/404-test","prerender":false,"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["_astro/404-test.f9075e7f.css"],"scripts":[{"type":"external","value":"_astro/hoisted.7f524736.js"}],"routeData":{"route":"/sessions","type":"page","pattern":"^\\/sessions\\/?$","segments":[[{"content":"sessions","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/sessions.astro","pathname":"/sessions","prerender":false,"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["_astro/404-test.f9075e7f.css"],"scripts":[{"type":"external","value":"_astro/hoisted.7f524736.js"}],"routeData":{"route":"/my-kutx","type":"page","pattern":"^\\/my-kutx\\/?$","segments":[[{"content":"my-kutx","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/my-kutx.astro","pathname":"/my-kutx","prerender":false,"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["_astro/index2.dede0c6e.css","_astro/404-test.f9075e7f.css"],"scripts":[{"type":"external","value":"_astro/hoisted.7f524736.js"}],"routeData":{"route":"/index2","type":"page","pattern":"^\\/index2\\/?$","segments":[[{"content":"index2","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/index2.astro","pathname":"/index2","prerender":false,"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["_astro/404-test.f9075e7f.css"],"scripts":[{"type":"external","value":"_astro/hoisted.7f524736.js"}],"routeData":{"route":"/404","type":"page","pattern":"^\\/404\\/?$","segments":[[{"content":"404","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/404.astro","pathname":"/404","prerender":false,"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["_astro/404-test.f9075e7f.css"],"scripts":[{"type":"external","value":"_astro/hoisted.7f524736.js"}],"routeData":{"route":"/[slug]","type":"page","pattern":"^\\/([^/]+?)\\/?$","segments":[[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/[slug].astro","prerender":false,"_meta":{"trailingSlash":"ignore"}}}],"base":"/","markdown":{"drafts":false,"syntaxHighlight":"shiki","shikiConfig":{"langs":[],"theme":"github-dark","wrap":false},"remarkPlugins":[],"rehypePlugins":[],"remarkRehype":{},"gfm":true,"smartypants":true},"pageMap":null,"propagation":[],"renderers":[],"entryModules":{"\u0000@astrojs-ssr-virtual-entry":"_@astrojs-ssr-virtual-entry.mjs","/Users/er35536/repos/utatsxsw-astro/node_modules/@astrojs/image/dist/vendor/squoosh/image-pool.js":"chunks/image-pool.c24d15b2.mjs","/astro/hoisted.js?q=1":"_astro/hoisted.7f524736.js","/astro/hoisted.js?q=0":"_astro/hoisted.79229368.js","/Users/er35536/repos/utatsxsw-astro/src/components/navi":"_astro/navi.40b25615.js","@astrojs/react/client.js":"_astro/client.502e3c6a.js","astro:scripts/before-hydration.js":""},"assets":["/_astro/index2.dede0c6e.css","/_astro/404-test.f9075e7f.css","/favicon.png","/fonts/1883Sans-Black.ttf","/fonts/1883Sans-Black.woff","/fonts/1883Sans-Black.woff2","/fonts/1883Sans-BlackItalic.ttf","/fonts/1883Sans-BlackItalic.woff","/fonts/1883Sans-BlackItalic.woff2","/fonts/1883Sans-Bold.ttf","/fonts/1883Sans-Bold.woff","/fonts/1883Sans-Bold.woff2","/fonts/1883Sans-BoldItalic.ttf","/fonts/1883Sans-BoldItalic.woff","/fonts/1883Sans-BoldItalic.woff2","/fonts/1883Sans-ExtraBold.ttf","/fonts/1883Sans-ExtraBold.woff","/fonts/1883Sans-ExtraBold.woff2","/fonts/1883Sans-ExtraBoldItalic.ttf","/fonts/1883Sans-ExtraBoldItalic.woff","/fonts/1883Sans-ExtraBoldItalic.woff2","/fonts/1883Sans-ExtraLight.ttf","/fonts/1883Sans-ExtraLight.woff","/fonts/1883Sans-ExtraLight.woff2","/fonts/1883Sans-ExtraLightItalic.ttf","/fonts/1883Sans-ExtraLightItalic.woff","/fonts/1883Sans-ExtraLightItalic.woff2","/fonts/1883Sans-Italic.ttf","/fonts/1883Sans-Italic.woff","/fonts/1883Sans-Italic.woff2","/fonts/1883Sans-Light.ttf","/fonts/1883Sans-Light.woff","/fonts/1883Sans-Light.woff2","/fonts/1883Sans-LightItalic.ttf","/fonts/1883Sans-LightItalic.woff","/fonts/1883Sans-LightItalic.woff2","/fonts/1883Sans-Medium.ttf","/fonts/1883Sans-Medium.woff","/fonts/1883Sans-Medium.woff2","/fonts/1883Sans-MediumItalic.ttf","/fonts/1883Sans-MediumItalic.woff","/fonts/1883Sans-MediumItalic.woff2","/fonts/1883Sans-Regular.ttf","/fonts/1883Sans-Regular.woff","/fonts/1883Sans-Regular.woff2","/fonts/1883Sans-SemiBold.ttf","/fonts/1883Sans-SemiBold.woff","/fonts/1883Sans-SemiBold.woff2","/fonts/1883Sans-SemiBoldItalic.ttf","/fonts/1883Sans-SemiBoldItalic.woff","/fonts/1883Sans-SemiBoldItalic.woff2","/fonts/1883Sans-Thin.ttf","/fonts/1883Sans-Thin.woff","/fonts/1883Sans-Thin.woff2","/fonts/1883Sans-ThinItalic.ttf","/fonts/1883Sans-ThinItalic.woff","/fonts/1883Sans-ThinItalic.woff2","/images/Dell-Technologies.svg","/images/Lucius-lg.png","/images/Lucius-sm.jpg","/images/Texas-Capital-Bank.svg","/images/The-Selfless-Lovers-lg.jpg","/images/The-Selfless-Lovers-sm.jpg","/images/The-Selfless-Lovers.jpg","/images/UT-McCombs-School-of-Business.svg","/images/bevo.gif","/images/bevo.svg","/images/burntorange-wave.svg","/images/discover-texas-mobile.svg","/images/discover-texas.png","/images/favicon-16x16.png","/images/favicon-32x32.png","/images/limestone-wave.svg","/images/logo.png","/images/squiggle-hookem.gif","/images/squiggle-hookem.svg","/images/sun-cloud.gif","/images/sun-cloud.svg","/images/sxsw-hookem.svg","/images/sxsw-sessions-edu.svg","/images/sxsw-sessions.svg","/images/tower.gif","/images/tower.svg","/images/ut-brand-primary.svg","/images/utexas-logo.png","/images/utsxsw-longhorn-band-live.jpg","/images/utsxsw-lucius-tall.png","/images/utsxsw-lucius.jpg","/images/utsxsw-mariachi-paredes.png","/images/utsxsw-networking.png","/images/utsxsw-panel-discovery-to-impact.png","/images/utsxsw-panel-fireside.png","/images/utsxsw-panel-nil.png","/images/utsxsw-pattern-A.png","/images/utsxsw-pattern-B1.png","/images/utsxsw-pattern-B2.png","/images/utsxsw-pattern-C1.png","/images/utsxsw-pattern-C2.png","/images/utsxsw-pattern-C3.png","/images/utsxsw-pattern.svg","/_astro/Layout.astro_astro_type_script_index_0_lang.4c4ce85f.js","/_astro/client.502e3c6a.js","/_astro/hoisted.79229368.js","/_astro/hoisted.7f524736.js","/_astro/index.f1bc5ebf.js","/_astro/navi.40b25615.js","/images/people/ut-sxsw-blake-lawrence.png","/images/people/ut-sxsw-carol-capitani.png","/images/people/ut-sxsw-cheryl-ingstad.png","/images/people/ut-sxsw-christine-dixon-thesing.png","/images/people/ut-sxsw-jay-hartzell.png","/images/people/ut-sxsw-jim-breyer.png","/images/people/ut-sxsw-john-kozarich.png","/images/people/ut-sxsw-john-schreck.png","/images/people/ut-sxsw-juli-johnston.png","/images/people/ut-sxsw-lisa-hannusch.png","/images/people/ut-sxsw-ricky-brown.png","/images/people/ut-sxsw-roger-wallace.png","/images/people/ut-sxsw-steve-sarkisian.png","/images/people/ut-sxsw-tim-league-l.jpg","/images/people/ut-sxsw-tim-league-p.jpeg"]}), {
	pageMap: pageMap,
	renderers: renderers
});
const _args = {};
const _exports = adapter.createExports(_manifest, _args);
const handler = _exports['handler'];

const _start = 'start';
if(_start in adapter) {
	adapter[_start](_manifest, _args);
}

export { handler, pageMap, renderers };
