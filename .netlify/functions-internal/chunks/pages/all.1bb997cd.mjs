import mime from 'mime';
import { dim, bold, red, yellow, cyan, green } from 'kleur/colors';
import sizeOf from 'image-size';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { c as createAstro, a as createComponent, r as renderTemplate, m as maybeRenderHead, _ as __astro_tag_component__, b as renderComponent, d as addAttribute, e as renderHead, f as renderSlot, s as spreadAttributes, u as unescapeHTML, F as Fragment } from '../astro.aaa6c455.mjs';
import { optimize } from 'svgo';
/* empty css                            */import { useState } from 'react';
import { faChevronUp, faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
/* empty css                              */import { jsxs, jsx } from 'react/jsx-runtime';

const PREFIX = "@astrojs/image";
const dateTimeFormat = new Intl.DateTimeFormat([], {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
});
const levels = {
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  silent: 90
};
function getPrefix(level, timestamp) {
  let prefix = "";
  if (timestamp) {
    prefix += dim(dateTimeFormat.format(new Date()) + " ");
  }
  switch (level) {
    case "debug":
      prefix += bold(green(`[${PREFIX}] `));
      break;
    case "info":
      prefix += bold(cyan(`[${PREFIX}] `));
      break;
    case "warn":
      prefix += bold(yellow(`[${PREFIX}] `));
      break;
    case "error":
      prefix += bold(red(`[${PREFIX}] `));
      break;
  }
  return prefix;
}
const log = (_level, dest) => ({ message, level, prefix = true, timestamp = true }) => {
  if (levels[_level] >= levels[level]) {
    dest(`${prefix ? getPrefix(level, timestamp) : ""}${message}`);
  }
};
const error = log("error", console.error);

async function metadata(src, data) {
  const file = data || await fs.readFile(src);
  const { width, height, type, orientation } = await sizeOf(file);
  const isPortrait = (orientation || 0) >= 5;
  if (!width || !height || !type) {
    return void 0;
  }
  return {
    src: fileURLToPath(src),
    width: isPortrait ? height : width,
    height: isPortrait ? width : height,
    format: type,
    orientation
  };
}

function isRemoteImage(src) {
  return /^(https?:)?\/\//.test(src);
}

function isOutputFormat(value) {
  return ["avif", "jpeg", "jpg", "png", "webp", "svg"].includes(value);
}
function isAspectRatioString(value) {
  return /^\d*:\d*$/.test(value);
}
class BaseSSRService {
  async getImageAttributes(transform) {
    const { width, height, src, format, quality, aspectRatio, ...rest } = transform;
    return {
      ...rest,
      width,
      height
    };
  }
  serializeTransform(transform) {
    const searchParams = new URLSearchParams();
    if (transform.quality) {
      searchParams.append("q", transform.quality.toString());
    }
    if (transform.format) {
      searchParams.append("f", transform.format);
    }
    if (transform.width) {
      searchParams.append("w", transform.width.toString());
    }
    if (transform.height) {
      searchParams.append("h", transform.height.toString());
    }
    if (transform.aspectRatio) {
      searchParams.append("ar", transform.aspectRatio.toString());
    }
    if (transform.fit) {
      searchParams.append("fit", transform.fit);
    }
    if (transform.background) {
      searchParams.append("bg", transform.background);
    }
    if (transform.position) {
      searchParams.append("p", encodeURI(transform.position));
    }
    searchParams.append("href", transform.src);
    return { searchParams };
  }
  parseTransform(searchParams) {
    if (!searchParams.has("href")) {
      return void 0;
    }
    let transform = { src: searchParams.get("href") };
    if (searchParams.has("q")) {
      transform.quality = parseInt(searchParams.get("q"));
    }
    if (searchParams.has("f")) {
      const format = searchParams.get("f");
      if (isOutputFormat(format)) {
        transform.format = format;
      }
    }
    if (searchParams.has("w")) {
      transform.width = parseInt(searchParams.get("w"));
    }
    if (searchParams.has("h")) {
      transform.height = parseInt(searchParams.get("h"));
    }
    if (searchParams.has("ar")) {
      const ratio = searchParams.get("ar");
      if (isAspectRatioString(ratio)) {
        transform.aspectRatio = ratio;
      } else {
        transform.aspectRatio = parseFloat(ratio);
      }
    }
    if (searchParams.has("fit")) {
      transform.fit = searchParams.get("fit");
    }
    if (searchParams.has("p")) {
      transform.position = decodeURI(searchParams.get("p"));
    }
    if (searchParams.has("bg")) {
      transform.background = searchParams.get("bg");
    }
    return transform;
  }
}

const imagePoolModulePromise = import('../image-pool.c24d15b2.mjs');
class SquooshService extends BaseSSRService {
  async processAvif(image, transform) {
    const encodeOptions = transform.quality ? { avif: { quality: transform.quality } } : { avif: {} };
    await image.encode(encodeOptions);
    const data = await image.encodedWith.avif;
    return {
      data: data.binary,
      format: "avif"
    };
  }
  async processJpeg(image, transform) {
    const encodeOptions = transform.quality ? { mozjpeg: { quality: transform.quality } } : { mozjpeg: {} };
    await image.encode(encodeOptions);
    const data = await image.encodedWith.mozjpeg;
    return {
      data: data.binary,
      format: "jpeg"
    };
  }
  async processPng(image, transform) {
    await image.encode({ oxipng: {} });
    const data = await image.encodedWith.oxipng;
    return {
      data: data.binary,
      format: "png"
    };
  }
  async processWebp(image, transform) {
    const encodeOptions = transform.quality ? { webp: { quality: transform.quality } } : { webp: {} };
    await image.encode(encodeOptions);
    const data = await image.encodedWith.webp;
    return {
      data: data.binary,
      format: "webp"
    };
  }
  async autorotate(transform, inputBuffer) {
    try {
      const meta = await metadata(transform.src, inputBuffer);
      switch (meta == null ? void 0 : meta.orientation) {
        case 3:
        case 4:
          return { type: "rotate", numRotations: 2 };
        case 5:
        case 6:
          return { type: "rotate", numRotations: 1 };
        case 7:
        case 8:
          return { type: "rotate", numRotations: 3 };
      }
    } catch {
    }
  }
  async transform(inputBuffer, transform) {
    if (transform.format === "svg") {
      return {
        data: inputBuffer,
        format: transform.format
      };
    }
    const operations = [];
    if (!isRemoteImage(transform.src)) {
      const autorotate = await this.autorotate(transform, inputBuffer);
      if (autorotate) {
        operations.push(autorotate);
      }
    } else if (transform.src.startsWith("//")) {
      transform.src = `https:${transform.src}`;
    }
    if (transform.width || transform.height) {
      const width = transform.width && Math.round(transform.width);
      const height = transform.height && Math.round(transform.height);
      operations.push({
        type: "resize",
        width,
        height
      });
    }
    if (!transform.format) {
      error({
        level: "info",
        prefix: false,
        message: red(`Unknown image output: "${transform.format}" used for ${transform.src}`)
      });
      throw new Error(`Unknown image output: "${transform.format}" used for ${transform.src}`);
    }
    const { processBuffer } = await imagePoolModulePromise;
    const data = await processBuffer(inputBuffer, operations, transform.format, transform.quality);
    return {
      data: Buffer.from(data),
      format: transform.format
    };
  }
}
const service = new SquooshService();
var squoosh_default = service;

const fnv1a52 = (str) => {
  const len = str.length;
  let i = 0, t0 = 0, v0 = 8997, t1 = 0, v1 = 33826, t2 = 0, v2 = 40164, t3 = 0, v3 = 52210;
  while (i < len) {
    v0 ^= str.charCodeAt(i++);
    t0 = v0 * 435;
    t1 = v1 * 435;
    t2 = v2 * 435;
    t3 = v3 * 435;
    t2 += v0 << 8;
    t3 += v1 << 8;
    t1 += t0 >>> 16;
    v0 = t0 & 65535;
    t2 += t1 >>> 16;
    v1 = t1 & 65535;
    v3 = t3 + (t2 >>> 16) & 65535;
    v2 = t2 & 65535;
  }
  return (v3 & 15) * 281474976710656 + v2 * 4294967296 + v1 * 65536 + (v0 ^ v3 >> 4);
};
const etag = (payload, weak = false) => {
  const prefix = weak ? 'W/"' : '"';
  return prefix + fnv1a52(payload).toString(36) + payload.length.toString(36) + '"';
};

async function loadRemoteImage(src) {
  try {
    const res = await fetch(src);
    if (!res.ok) {
      return void 0;
    }
    return Buffer.from(await res.arrayBuffer());
  } catch (err) {
    console.error(err);
    return void 0;
  }
}
const get$1 = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const transform = squoosh_default.parseTransform(url.searchParams);
    let inputBuffer = void 0;
    const sourceUrl = isRemoteImage(transform.src) ? new URL(transform.src) : new URL(transform.src, url.origin);
    inputBuffer = await loadRemoteImage(sourceUrl);
    if (!inputBuffer) {
      return new Response("Not Found", { status: 404 });
    }
    const { data, format } = await squoosh_default.transform(inputBuffer, transform);
    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": mime.getType(format) || "",
        "Cache-Control": "public, max-age=31536000",
        ETag: etag(data.toString()),
        Date: new Date().toUTCString()
      }
    });
  } catch (err) {
    console.error(err);
    return new Response(`Server Error: ${err}`, { status: 500 });
  }
};

const _page0 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  get: get$1
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro$u = createAstro();
const $$Footer = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$u, $$props, $$slots);
  Astro2.self = $$Footer;
  return renderTemplate`${maybeRenderHead($$result)}<footer class="container px-6 py-10 font-eighteeneightythree text-white">
  <div id="ut-footer-row-1" class="container md:grid md:w-full md:grid-cols-12 md:justify-end">
    <a class="md:col-span-6" href="//www.utexas.edu">
      <img alt="UT at SXSW" class="mx-auto w-96 py-5 md:mx-0 md:w-48 lg:w-64" src="/images/ut-brand-primary.svg">
    </a>
    <div class="text-center md:col-span-3">
      <p>Main Building &#40;MAI&#41;</p>
      <p>110 Inner Campus Drive</p>
      <p>Austin, TX 78705</p>
      <a href="mailto:utsxsw@utexas.edu" class="hover:underline"> utsxsw@utexas.edu</a>
    </div>

    <div class="md:col-span-3">
      <ul class="m-9 flex items-start justify-evenly md:m-0">
        <li class="">
          <a href="https://www.facebook.com/UTAustinTX">
            <span class="sr-only">UT Austin on Facebook</span>
            <svg class="icon-class fill-current transition-all duration-300 hover:text-tangerineorange" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
              <path d="M400 32H48A48 48 0 0 0 0 80v352a48 48 0 0 0 48 48h137.25V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.27c-30.81 0-40.42 19.12-40.42 38.73V256h68.78l-11 71.69h-57.78V480H400a48 48 0 0 0 48-48V80a48 48 0 0 0-48-48z"></path></svg>
          </a>
        </li>
        <li class="">
          <a href="https://twitter.com/UTAustin">
            <span class="sr-only">UT Austin on Twitter</span>
            <svg class="icon-class fill-current transition-all duration-300 hover:text-tangerineorange" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
              <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path></svg>
          </a>
        </li>
        <li class="">
          <a href="http://instagram.com/UTAustinTX">
            <span class="sr-only">UT Austin on Instagram</span>
            <svg class="icon-class fill-current transition-all duration-300 hover:text-tangerineorange" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
              <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path></svg>
          </a>
        </li>
        <li class="">
          <a href="https://www.linkedin.com/edu/the-university-of-texas-at-austin-19518">
            <span class="sr-only">UT Austin on LinkedIn</span>
            <svg class="icon-class fill-current transition-all duration-300 hover:text-tangerineorange" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
              <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"></path></svg>
          </a>
        </li>
        <li class="">
          <a href="https://www.youtube.com/channel/UCCLiPoSjzG1PVWyRtq0G3Fw">
            <span class="sr-only">UT Austin on YouTube</span>
            <svg class="icon-class fill-current transition-all duration-300 hover:text-tangerineorange" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 576 512"><!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
              <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"></path></svg>
          </a>
        </li>
      </ul>
    </div>
  </div>

  <div id="ut-footer-row-2" class="container mt-9 text-center md:mt-20 md:grid md:grid-cols-12">
    <div class="m-9 md:col-span-3 md:m-0 md:text-left">
      <p>
        ©
        <a href="https://www.utexas.edu" class="hover:underline"> The University of Texas at Austin</a>
        ${new Date().getFullYear()}
      </p>
    </div>

    <ul class="flex flex-col items-center md:col-span-9 md:flex-row md:justify-end">
      <li class="">
        <a href="https://www.utexas.edu/emergency" class="pr-2 hover:underline"> Emergency Information</a>
      </li>
      <li>
        <a href="https://www.utexas.edu/site-policies" class="border-white px-2 hover:underline xl:border-l"> Site Policies</a>
      </li>
      <li>
        <a href="https://it.utexas.edu/policies/web-accessibility" class="border-white px-2 hover:underline xl:border-l"> Web Accessibility Policy</a>
      </li>
      <li>
        <a href="https://it.utexas.edu/policies/web-privacy" class="border-white px-2 hover:underline xl:border-l"> Web Privacy Policy</a>
      </li>
    </ul>
  </div>
</footer>`;
}, "/Users/er35536/repos/utatsxsw-astro/src/components/footer.astro");

const Navi = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTwoOpen, setIsTwoOpen] = useState(false);
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  const toggleTwoMenu = () => {
    setIsTwoOpen(!isTwoOpen);
  };
  const closeMenu = () => {
    setIsOpen(false);
  };
  const closeTwoMenu = () => {
    setIsTwoOpen(false);
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "mx-5 font-eighteeneightythree md:col-span-9 md:mx-0 md:grid md:grid-cols-6 md:justify-items-center md:gap-6 lg:grid-cols-12 lg:justify-items-end",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "group relative md:col-span-2 md:col-start-2 lg:col-span-1 lg:col-start-6 xl:col-start-8",
      onMouseLeave: closeMenu,
      role: "button",
      tabIndex: "0",
      children: [/* @__PURE__ */ jsxs("button", {
        className: "text-md block w-full cursor-pointer self-center whitespace-nowrap bg-burntorange py-3 px-4 uppercase text-white transition-colors\n            hover:text-white hover:no-underline group-hover:bg-burntorange-dark lg:text-lg",
        onClick: toggleMenu,
        children: ["March 11 Event", /* @__PURE__ */ jsx(FontAwesomeIcon, {
          className: "ml-1",
          icon: isOpen ? faChevronUp : faChevronDown
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: `z-100 menu-overlay h-0 w-full overflow-hidden border-0 bg-white opacity-0 drop-shadow-xl transition-all md:absolute md:right-0 md:w-72 lg:left-0 ${isOpen ? "is-open h-fit opacity-100" : ""}`,
        children: /* @__PURE__ */ jsxs("ul", {
          className: "min-w-[20rem]",
          children: [/* @__PURE__ */ jsx("li", {
            className: "cursor-default bg-limestone-light p-3 uppercase text-charcoal",
            children: "Saturday, March 11, 2023"
          }), /* @__PURE__ */ jsxs("ul", {
            children: [/* @__PURE__ */ jsx("li", {
              className: "",
              children: /* @__PURE__ */ jsxs("a", {
                className: "block pt-3 pr-3 pb-3 pl-6 text-burntorange transition-colors hover:bg-burntorange-dark hover:text-white hover:no-underline",
                href: "/my-kutx",
                children: ["My KUTX Live", /* @__PURE__ */ jsx(FontAwesomeIcon, {
                  className: "ml-1",
                  icon: faChevronRight
                })]
              })
            }), /* @__PURE__ */ jsxs("li", {
              className: "cursor-default text-charcoal",
              children: [/* @__PURE__ */ jsx("span", {
                className: "pl-6 pb-3",
                children: "UT Expert Panel Sessions:"
              }), /* @__PURE__ */ jsxs("ul", {
                className: "cursor-pointer",
                children: [/* @__PURE__ */ jsx("li", {
                  children: /* @__PURE__ */ jsxs("a", {
                    className: "block py-1.5 pl-9 text-burntorange transition-colors hover:bg-burntorange-dark hover:text-white hover:no-underline",
                    href: "/discovery-to-impact",
                    children: ["Discovery to Impact", /* @__PURE__ */ jsx(FontAwesomeIcon, {
                      className: "ml-1",
                      icon: faChevronRight
                    })]
                  })
                }), /* @__PURE__ */ jsx("li", {
                  children: /* @__PURE__ */ jsxs("a", {
                    className: "block py-1.5 pr-9 pl-9 text-burntorange transition-colors hover:bg-burntorange-dark hover:text-white hover:no-underline",
                    href: "/name-image-likeness",
                    children: ["Name, Image, Likeness (NIL)", /* @__PURE__ */ jsx(FontAwesomeIcon, {
                      className: "ml-1",
                      icon: faChevronRight
                    })]
                  })
                }), /* @__PURE__ */ jsx("li", {
                  children: /* @__PURE__ */ jsxs("a", {
                    className: "block py-1.5 pl-9 text-burntorange transition-colors hover:bg-burntorange-dark hover:text-white hover:no-underline",
                    href: "/fireside-chat",
                    children: ["Fireside Chat", /* @__PURE__ */ jsx(FontAwesomeIcon, {
                      className: "ml-1",
                      icon: faChevronRight
                    })]
                  })
                })]
              })]
            }), /* @__PURE__ */ jsx("li", {
              children: /* @__PURE__ */ jsxs("a", {
                className: "block pt-3 pr-3 pb-3 pl-6 text-burntorange transition-colors hover:bg-burntorange-dark hover:text-white hover:no-underline",
                href: "/burnt-orange-bash",
                children: ["Burnt Orange Bash", /* @__PURE__ */ jsx(FontAwesomeIcon, {
                  className: "ml-1",
                  icon: faChevronRight
                })]
              })
            })]
          })]
        })
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "group col-end-13 md:col-span-3 lg:col-start-9 xl:col-start-10",
      onMouseLeave: closeTwoMenu,
      role: "button",
      tabIndex: "0",
      children: [/* @__PURE__ */ jsxs("button", {
        className: "text-md w-full cursor-pointer whitespace-nowrap bg-burntorange py-3 px-4 font-eighteeneightythree uppercase text-white transition-colors hover:text-white hover:no-underline\n            group-hover:bg-burntorange-dark lg:text-lg",
        onClick: toggleTwoMenu,
        children: ["UT SXSW Sessions", /* @__PURE__ */ jsx(FontAwesomeIcon, {
          className: "ml-1",
          icon: isTwoOpen ? faChevronUp : faChevronDown
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: `menu-overlay h-0 w-full overflow-hidden bg-white opacity-0 drop-shadow-xl transition-all md:absolute md:w-fit  ${isTwoOpen ? "is-open h-fit opacity-100" : ""}`,
        children: /* @__PURE__ */ jsxs("ul", {
          className: "list-none",
          children: [/* @__PURE__ */ jsx("li", {
            className: "cursor-default bg-limestone-light p-3 uppercase text-charcoal",
            children: "March 6—19, 2023"
          }), /* @__PURE__ */ jsxs("ul", {
            children: [/* @__PURE__ */ jsx("li", {
              children: /* @__PURE__ */ jsxs("a", {
                className: "block pt-3 pr-3 pb-3 pl-3 text-burntorange transition-colors hover:bg-burntorange-dark hover:text-white hover:no-underline",
                href: "/sessions-edu",
                children: ["All UT SXSW EDU Sessions", /* @__PURE__ */ jsx(FontAwesomeIcon, {
                  className: "ml-1",
                  icon: faChevronRight
                })]
              })
            }), /* @__PURE__ */ jsx("li", {
              children: /* @__PURE__ */ jsxs("a", {
                className: "block pt-3 pr-3 pb-3 pl-3 text-burntorange transition-colors hover:bg-burntorange-dark hover:text-white hover:no-underline",
                href: "/sessions",
                children: ["All UT SXSW Sessions", /* @__PURE__ */ jsx(FontAwesomeIcon, {
                  className: "ml-1",
                  icon: faChevronRight
                })]
              })
            })]
          })]
        })
      })]
    })]
  });
};
__astro_tag_component__(Navi, "@astrojs/react");

const $$Astro$t = createAstro();
const $$Navigation = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$t, $$props, $$slots);
  Astro2.self = $$Navigation;
  return renderTemplate`${maybeRenderHead($$result)}<header class="sticky top-0 z-50 bg-burntorange">
  <nav class="container navbar mx-auto grid md:grid-flow-col">
    <div class="mx-auto">
      <a href="/" class="w-96 md:w-48 lg:w-64"><img alt="UT at SXSW" class="w-100 py-4" src="/images/ut-brand-primary.svg"></a>
    </div>

    <div class="grid">${renderComponent($$result, "Navi", Navi, { "client:idle": true, "client:component-hydration": "idle", "client:component-path": "/Users/er35536/repos/utatsxsw-astro/src/components/navi", "client:component-export": "default" })}</div>
  </nav>
</header>`;
}, "/Users/er35536/repos/utatsxsw-astro/src/components/navigation.astro");

const $$Astro$s = createAstro();
const $$Layout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$s, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title } = Astro2.props;
  const siteTitle = "Discover Texas at SXSW";
  return renderTemplate`<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width">
    <link rel="icon" type="image/svg+xml" href="/favicon.png">
    <meta name="generator"${addAttribute(Astro2.generator, "content")}>
    <title>${title} | ${siteTitle}</title>
    <!-- Google Tag Manager -->
    
    <!-- End Google Tag Manager -->
  ${renderHead($$result)}</head>
  <body>
    ${renderComponent($$result, "Navigation", $$Navigation, {})}
    ${renderSlot($$result, $$slots["default"])}
    ${renderComponent($$result, "Footer", $$Footer, {})}
  </body></html>`;
}, "/Users/er35536/repos/utatsxsw-astro/src/layouts/Layout.astro");

const $$Astro$r = createAstro();
const $$SeeYouThere = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$r, $$props, $$slots);
  Astro2.self = $$SeeYouThere;
  const { image, date, time, headline, blurb } = Astro2.props;
  return renderTemplate`${maybeRenderHead($$result)}<section class="relative -z-50 bg-limestone-light bg-c1 bg-cover bg-center bg-no-repeat opacity-95">
  <div class="container grid w-5/6 grid-cols-12 lg:max-w-4xl">
    <div class="col-span-12 my-24 bg-burntorange py-9 px-2 md:py-16">
      <img${addAttribute(image, "src")} class="mx-auto w-1/12 pb-3">
      <p class="text-center font-eighteeneightythree text-2xl text-white md:text-3xl">
        ${date}
      </p>
      <p class="text-center font-eighteeneightythree text-2xl text-white md:text-3xl">
        ${time}
      </p>
      <h1 class="my-4 text-center font-enzo text-4xl uppercase text-white md:text-7xl">
        ${headline}
      </h1>
      <p class="text-center font-eighteeneightythree text-xl text-white md:text-2xl">
        ${blurb}
      </p>
    </div>
  </div>
</section>`;
}, "/Users/er35536/repos/utatsxsw-astro/src/components/see-you-there.astro");

const SPRITESHEET_NAMESPACE = `astroicon`;

const baseURL = "https://api.astroicon.dev/v1/";
const requests = /* @__PURE__ */ new Map();
const fetchCache = /* @__PURE__ */ new Map();
async function get(pack, name) {
  const url = new URL(`./${pack}/${name}`, baseURL).toString();
  if (requests.has(url)) {
    return await requests.get(url);
  }
  if (fetchCache.has(url)) {
    return fetchCache.get(url);
  }
  let request = async () => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(await res.text());
    }
    const contentType = res.headers.get("Content-Type");
    if (!contentType.includes("svg")) {
      throw new Error(`[astro-icon] Unable to load "${name}" because it did not resolve to an SVG!

Recieved the following "Content-Type":
${contentType}`);
    }
    const svg = await res.text();
    fetchCache.set(url, svg);
    requests.delete(url);
    return svg;
  };
  let promise = request();
  requests.set(url, promise);
  return await promise;
}

const splitAttrsTokenizer = /([a-z0-9_\:\-]*)\s*?=\s*?(['"]?)(.*?)\2\s+/gim;
const domParserTokenizer = /(?:<(\/?)([a-zA-Z][a-zA-Z0-9\:]*)(?:\s([^>]*?))?((?:\s*\/)?)>|(<\!\-\-)([\s\S]*?)(\-\->)|(<\!\[CDATA\[)([\s\S]*?)(\]\]>))/gm;
const splitAttrs = (str) => {
  let res = {};
  let token;
  if (str) {
    splitAttrsTokenizer.lastIndex = 0;
    str = " " + (str || "") + " ";
    while (token = splitAttrsTokenizer.exec(str)) {
      res[token[1]] = token[3];
    }
  }
  return res;
};
function optimizeSvg(contents, name, options) {
  return optimize(contents, {
    plugins: [
      "removeDoctype",
      "removeXMLProcInst",
      "removeComments",
      "removeMetadata",
      "removeXMLNS",
      "removeEditorsNSData",
      "cleanupAttrs",
      "minifyStyles",
      "convertStyleToAttrs",
      {
        name: "cleanupIDs",
        params: { prefix: `${SPRITESHEET_NAMESPACE}:${name}` }
      },
      "removeRasterImages",
      "removeUselessDefs",
      "cleanupNumericValues",
      "cleanupListOfValues",
      "convertColors",
      "removeUnknownsAndDefaults",
      "removeNonInheritableGroupAttrs",
      "removeUselessStrokeAndFill",
      "removeViewBox",
      "cleanupEnableBackground",
      "removeHiddenElems",
      "removeEmptyText",
      "convertShapeToPath",
      "moveElemsAttrsToGroup",
      "moveGroupAttrsToElems",
      "collapseGroups",
      "convertPathData",
      "convertTransform",
      "removeEmptyAttrs",
      "removeEmptyContainers",
      "mergePaths",
      "removeUnusedNS",
      "sortAttrs",
      "removeTitle",
      "removeDesc",
      "removeDimensions",
      "removeStyleElement",
      "removeScriptElement"
    ]
  }).data;
}
const preprocessCache = /* @__PURE__ */ new Map();
function preprocess(contents, name, { optimize }) {
  if (preprocessCache.has(contents)) {
    return preprocessCache.get(contents);
  }
  if (optimize) {
    contents = optimizeSvg(contents, name);
  }
  domParserTokenizer.lastIndex = 0;
  let result = contents;
  let token;
  if (contents) {
    while (token = domParserTokenizer.exec(contents)) {
      const tag = token[2];
      if (tag === "svg") {
        const attrs = splitAttrs(token[3]);
        result = contents.slice(domParserTokenizer.lastIndex).replace(/<\/svg>/gim, "").trim();
        const value = { innerHTML: result, defaultProps: attrs };
        preprocessCache.set(contents, value);
        return value;
      }
    }
  }
}
function normalizeProps(inputProps) {
  const size = inputProps.size;
  delete inputProps.size;
  const w = inputProps.width ?? size;
  const h = inputProps.height ?? size;
  const width = w ? toAttributeSize(w) : void 0;
  const height = h ? toAttributeSize(h) : void 0;
  return { ...inputProps, width, height };
}
const toAttributeSize = (size) => String(size).replace(/(?<=[0-9])x$/, "em");
async function load(name, inputProps, optimize) {
  const key = name;
  if (!name) {
    throw new Error("<Icon> requires a name!");
  }
  let svg = "";
  let filepath = "";
  if (name.includes(":")) {
    const [pack, ..._name] = name.split(":");
    name = _name.join(":");
    filepath = `/src/icons/${pack}`;
    let get$1;
    try {
      const files = /* #__PURE__ */ Object.assign({

});
      const keys = Object.fromEntries(
        Object.keys(files).map((key2) => [key2.replace(/\.[cm]?[jt]s$/, ""), key2])
      );
      if (!(filepath in keys)) {
        throw new Error(`Could not find the file "${filepath}"`);
      }
      const mod = files[keys[filepath]];
      if (typeof mod.default !== "function") {
        throw new Error(
          `[astro-icon] "${filepath}" did not export a default function!`
        );
      }
      get$1 = mod.default;
    } catch (e) {
    }
    if (typeof get$1 === "undefined") {
      get$1 = get.bind(null, pack);
    }
    const contents = await get$1(name, inputProps);
    if (!contents) {
      throw new Error(
        `<Icon pack="${pack}" name="${name}" /> did not return an icon!`
      );
    }
    if (!/<svg/gim.test(contents)) {
      throw new Error(
        `Unable to process "<Icon pack="${pack}" name="${name}" />" because an SVG string was not returned!

Recieved the following content:
${contents}`
      );
    }
    svg = contents;
  } else {
    filepath = `/src/icons/${name}.svg`;
    try {
      const files = /* #__PURE__ */ Object.assign({});
      if (!(filepath in files)) {
        throw new Error(`Could not find the file "${filepath}"`);
      }
      const contents = files[filepath];
      if (!/<svg/gim.test(contents)) {
        throw new Error(
          `Unable to process "${filepath}" because it is not an SVG!

Recieved the following content:
${contents}`
        );
      }
      svg = contents;
    } catch (e) {
      throw new Error(
        `[astro-icon] Unable to load "${filepath}". Does the file exist?`
      );
    }
  }
  const { innerHTML, defaultProps } = preprocess(svg, key, { optimize });
  if (!innerHTML.trim()) {
    throw new Error(`Unable to parse "${filepath}"!`);
  }
  return {
    innerHTML,
    props: { ...defaultProps, ...normalizeProps(inputProps) }
  };
}

const $$Astro$q = createAstro();
const $$Icon = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$q, $$props, $$slots);
  Astro2.self = $$Icon;
  let { name, pack, title, optimize = true, class: className, ...inputProps } = Astro2.props;
  let props = {};
  if (pack) {
    name = `${pack}:${name}`;
  }
  let innerHTML = "";
  try {
    const svg = await load(name, { ...inputProps, class: className }, optimize);
    innerHTML = svg.innerHTML;
    props = svg.props;
  } catch (e) {
    {
      throw new Error(`[astro-icon] Unable to load icon "${name}"!
${e}`);
    }
  }
  return renderTemplate`${maybeRenderHead($$result)}<svg${spreadAttributes(props)}${addAttribute(name, "astro-icon")}>${unescapeHTML((title ? `<title>${title}</title>` : "") + innerHTML)}</svg>`;
}, "/Users/er35536/repos/utatsxsw-astro/node_modules/astro-icon/lib/Icon.astro");

const sprites = /* @__PURE__ */ new WeakMap();
function trackSprite(request, name) {
  let currentSet = sprites.get(request);
  if (!currentSet) {
    currentSet = /* @__PURE__ */ new Set([name]);
  } else {
    currentSet.add(name);
  }
  sprites.set(request, currentSet);
}
const warned = /* @__PURE__ */ new Set();
async function getUsedSprites(request) {
  const currentSet = sprites.get(request);
  if (currentSet) {
    return Array.from(currentSet);
  }
  if (!warned.has(request)) {
    const { pathname } = new URL(request.url);
    console.log(`[astro-icon] No sprites found while rendering "${pathname}"`);
    warned.add(request);
  }
  return [];
}

const $$Astro$p = createAstro();
const $$Spritesheet = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$p, $$props, $$slots);
  Astro2.self = $$Spritesheet;
  const { optimize = true, style, ...props } = Astro2.props;
  const names = await getUsedSprites(Astro2.request);
  const icons = await Promise.all(names.map((name) => {
    return load(name, {}, optimize).then((res) => ({ ...res, name })).catch((e) => {
      {
        throw new Error(`[astro-icon] Unable to load icon "${name}"!
${e}`);
      }
    });
  }));
  return renderTemplate`${maybeRenderHead($$result)}<svg${addAttribute(`position: absolute; width: 0; height: 0; overflow: hidden; ${style ?? ""}`.trim(), "style")}${spreadAttributes({ "aria-hidden": true, ...props })} astro-icon-spritesheet>
    ${icons.map((icon) => renderTemplate`<symbol${spreadAttributes(icon.props)}${addAttribute(`${SPRITESHEET_NAMESPACE}:${icon.name}`, "id")}>${unescapeHTML(icon.innerHTML)}</symbol>`)}
</svg>`;
}, "/Users/er35536/repos/utatsxsw-astro/node_modules/astro-icon/lib/Spritesheet.astro");

const $$Astro$o = createAstro();
const $$SpriteProvider = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$o, $$props, $$slots);
  Astro2.self = $$SpriteProvider;
  const content = await Astro2.slots.render("default");
  return renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${unescapeHTML(content)}` })}
${renderComponent($$result, "Spritesheet", $$Spritesheet, {})}`;
}, "/Users/er35536/repos/utatsxsw-astro/node_modules/astro-icon/lib/SpriteProvider.astro");

const $$Astro$n = createAstro();
const $$Sprite = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$n, $$props, $$slots);
  Astro2.self = $$Sprite;
  let { name, pack, title, class: className, x, y, ...inputProps } = Astro2.props;
  const props = normalizeProps(inputProps);
  if (pack) {
    name = `${pack}:${name}`;
  }
  const href = `#${SPRITESHEET_NAMESPACE}:${name}`;
  trackSprite(Astro2.request, name);
  return renderTemplate`${maybeRenderHead($$result)}<svg${spreadAttributes(props)}${addAttribute(className, "class")}${addAttribute(name, "astro-icon")}>
    ${title ? renderTemplate`<title>${title}</title>` : ""}
    <use${spreadAttributes({ "xlink:href": href, width: props.width, height: props.height, x, y })}></use>
</svg>`;
}, "/Users/er35536/repos/utatsxsw-astro/node_modules/astro-icon/lib/Sprite.astro");

Object.assign($$Sprite, { Provider: $$SpriteProvider });

const $$Astro$m = createAstro();
const $$MyKutxSection = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$m, $$props, $$slots);
  Astro2.self = $$MyKutxSection;
  return renderTemplate`${maybeRenderHead($$result)}<section class="bg-limestone-light bg-c3 bg-cover bg-center bg-no-repeat opacity-95">
  <div class="bg-limestone-light">
    <div class="container md:grid md:w-4/5 md:grid-cols-12 md:py-10 lg:w-3/5 lg:max-w-5xl">
      <div class="flex flex-wrap content-center py-4 px-5 md:col-span-6">
        <h3 class="font-enzo text-4xl uppercase text-utorange md:text-5xl">My KUTX</h3>
        <p class="mt-4 font-eighteeneightythree text-2xl text-ut-charcoal--s40">KUTX will play music to kick off an exciting day and interview a very special guest...</p>
      </div>
      <img class="m-auto md:col-span-6 md:w-[35vw] lg:w-[25vw]" src="../images/bevo.gif" alt="Bevo nodding">
    </div>
  </div>

  <div class="container grid w-4/5 grid-cols-12 lg:max-w-5xl lg:justify-items-center">
    <div class="col-span-12 my-16 items-start bg-white p-0 md:grid md:grid-cols-12 md:items-center">
      <div class="md:order-2 md:col-span-6">
        <img loading="lazy" src="../images/people/ut-sxsw-tim-league-l.jpg" alt="My KUTX">
      </div>
      <div class="order-2 place-self-center p-8 font-eighteeneightythree md:col-span-6">
        <p class="font-eighteeneightythreebold text-xl text-charcoal">10 – 11 a.m.</p>
        <p class="my-1 font-eighteeneightythreeblack text-2xl text-burntorange md:text-3xl lg:text-4xl">My KUTX</p>
        <p class="my-3 text-xl text-ut-charcoal--s40">Conversation with Tim League, Alamo Drafthouse Cinema Founder and Executive Chairman</p>
        <div class="">
          <a href="/my-kutx" class="burntorange mt-3 block cursor-pointer self-center border-2 border-solid bg-white py-1 px-4 text-center font-eighteeneightythree uppercase text-burntorange transition-colors hover:border-burntorange-dark hover:bg-burntorange-dark hover:text-white hover:no-underline md:w-1/2 md:px-1">
            Details${renderComponent($$result, "Icon", $$Icon, { "class": "mb-1 inline h-8 w-8 fill-current", "name": "mdi:chevron-right" })}
          </a>
        </div>
      </div>
    </div>
  </div>
</section>`;
}, "/Users/er35536/repos/utatsxsw-astro/src/components/my-kutx-section.astro");

const $$Astro$l = createAstro();
const $$ExpertPanelSection = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$l, $$props, $$slots);
  Astro2.self = $$ExpertPanelSection;
  return renderTemplate`${maybeRenderHead($$result)}<section class="bg-limestone">
  <div class="container py-12 md:grid md:w-4/5 md:grid-cols-12 lg:w-3/5 lg:max-w-5xl">
    <div class="flex flex-wrap content-center py-4 px-5 md:order-2 md:col-span-6">
      <h3 class="font-enzo text-4xl uppercase text-utorange md:text-5xl">Expert Panel Sessions</h3>
      <p class="mt-4 font-eighteeneightythree text-2xl text-ut-charcoal--s40">University, industry and venture capital leaders will discuss how the surging Austin ecosystem intersects with public research universities to fuel entrepreneurship and innovation.</p>
    </div>
    <img class="m-auto md:order-1 md:col-span-6 md:w-[35vw] lg:w-[25vw]" src="../images/sun-cloud.gif" alt="a cloud and spinning sun">
  </div>
</section>

<section class="bg-limestone bg-c2 bg-cover bg-center bg-no-repeat opacity-95">
  <div class="container grid w-4/5 grid-cols-12 lg:max-w-5xl lg:justify-items-center">
    <div class="col-span-12 mb-6 mt-16 items-start bg-white p-0 md:grid md:grid-cols-12 md:items-center">
      <div class="md:order-2 md:col-span-6">
        <img src="../images/utsxsw-panel-discovery-to-impact.png" alt="Discovery to Impact">
      </div>
      <div class="order-1 place-self-center p-8 font-eighteeneightythree text-burntorange md:col-span-6">
        <p class="font-eighteeneightythreebold text-xl text-charcoal">1 — 2 p.m.</p>
        <p class="mt-2 mb-6 font-eighteeneightythreeblack text-2xl md:text-3xl lg:text-4xl">The Future of Tech? It Looks a Lot Like Austin</p>
        <div>
          <a href="/discovery-to-impact" class="burntorange block cursor-pointer self-center border-2 border-solid bg-white py-2 px-4 text-center font-eighteeneightythree uppercase text-burntorange transition-colors hover:border-burntorange-dark hover:bg-burntorange-dark hover:text-white hover:no-underline md:w-1/2 md:px-1">
            Details${renderComponent($$result, "Icon", $$Icon, { "class": "mb-1 inline h-8 w-8 fill-current", "name": "mdi:chevron-right" })}
          </a>
        </div>
      </div>
    </div>

    <div class="col-span-12 my-6 items-start bg-white p-0 md:grid md:grid-cols-12 md:items-center">
      <div class="md:col-span-6">
        <img src="../images/utsxsw-panel-nil.png" alt="Discovery to Impact">
      </div>
      <div class="place-self-center p-8 font-eighteeneightythree text-burntorange md:col-span-6">
        <p class="font-eighteeneightythreebold text-xl text-charcoal">2:30 — 3:30 p.m.</p>
        <p class="mt-2 mb-6 font-eighteeneightythreeblack text-2xl md:text-3xl lg:text-4xl">How NIL is Changing the Game for College Athletics</p>
        <div class="">
          <a href="/name-image-likeness" class="burntorange block cursor-pointer self-center border-2 border-solid bg-white py-2 px-4 text-center font-eighteeneightythree uppercase text-burntorange transition-colors hover:border-burntorange-dark hover:bg-burntorange-dark hover:text-white hover:no-underline md:w-1/2 md:px-1">
            Details${renderComponent($$result, "Icon", $$Icon, { "class": "mb-1 inline h-8 w-8 fill-current", "name": "mdi:chevron-right" })}
          </a>
        </div>
      </div>
    </div>

    <div class="col-span-12 mt-6 mb-16 items-start bg-white p-0 md:grid md:grid-cols-12 md:items-center">
      <div class="md:order-2 md:col-span-6">
        <img src="../images/utsxsw-panel-fireside.png" alt="Discovery to Impact">
      </div>
      <div class="order-1 place-self-center p-8 font-eighteeneightythree text-burntorange md:col-span-6">
        <p class="font-eighteeneightythreebold text-xl text-charcoal">4 — 5 p.m.</p>
        <p class="mt-2 mb-6 font-eighteeneightythreeblack text-2xl md:text-3xl lg:text-4xl">Building a Hub of Academic and Business Innovation</p>
        <div class="">
          <a href="/fireside-chat" class="burntorange block cursor-pointer self-center border-2 border-solid bg-white py-2 px-4 text-center font-eighteeneightythree uppercase text-burntorange transition-colors hover:border-burntorange-dark hover:bg-burntorange-dark hover:text-white hover:no-underline md:w-1/2 md:px-1">
            Details${renderComponent($$result, "Icon", $$Icon, { "class": "mb-1 inline h-8 w-8 fill-current", "name": "mdi:chevron-right" })}
          </a>
        </div>
      </div>
    </div>
  </div>
</section>`;
}, "/Users/er35536/repos/utatsxsw-astro/src/components/expert-panel-section.astro");

const $$Astro$k = createAstro();
const $$BandsSection = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$k, $$props, $$slots);
  Astro2.self = $$BandsSection;
  return renderTemplate`${maybeRenderHead($$result)}<section class="bg-a bg-cover bg-center bg-no-repeat opacity-95">
  <div class="container py-12 md:grid md:w-4/5 md:grid-cols-12 lg:w-3/5 lg:max-w-5xl">
    <div class="flex flex-col content-center py-4 px-6 md:col-span-6">
      <p class="font-eighteeneightythreebold text-xl text-white">6 — 9 p.m.</p>
      <h3 class="mt-2 font-enzo text-4xl uppercase text-white md:text-5xl">Burnt Orange Bash</h3>
      <p class="mt-4 font-eighteeneightythree text-2xl text-white">We’ll end the day with a Texas-sized celebration featuring Nik Parr &amp; The Selfless Lovers and special guest Lucius.</p>
      <a href="/burnt-orange-bash" class="my-5 w-full cursor-pointer self-start bg-white py-2 text-center font-eighteeneightythree text-sm uppercase text-burntorange transition-colors hover:border-burntorange-dark hover:bg-burntorange-dark hover:text-white hover:no-underline md:px-1 lg:w-3/5 lg:text-lg">
        Details${renderComponent($$result, "Icon", $$Icon, { "class": "mb-1 inline h-8 w-8 fill-current", "name": "mdi:chevron-right" })}
      </a>
    </div>
    <img class="m-auto md:col-span-6 md:w-[35vw] lg:w-[25vw]" src="../images/squiggle-hookem.gif" alt="Texas symbols">
  </div>

  <section class="relative -z-50 my-16 bg-transparent">
    <div class="container relative flex px-10">
      <div class="hidden w-1/3 md:inline">
        <img src="../images/The-Selfless-Lovers-sm.jpg" alt="Mariachi" class="h-full">
      </div>
      <div class="relative w-full md:w-2/3">
        <img src="../images/The-Selfless-Lovers-lg.jpg" alt="Mariachi">
        <div class="absolute left-0 bottom-0 m-3 bg-white px-6 py-2 lg:m-5 lg:py-3 lg:px-12 xl:px-16">
          <h3 class="font-enzo text-xl text-utorange lg:text-3xl xl:text-4xl">Nik Parr &amp; The Selfless Lovers</h3>
        </div>
      </div>
    </div>
    <div class="container flex px-10">
      <div class="relative w-full pb-10 md:w-2/3 md:pb-0">
        <img src="../images/Lucius-lg.png" alt="lucius">
        <div class="absolute right-0 top-0 m-3 bg-white px-6 py-2 lg:m-5 lg:py-3 lg:px-12 xl:px-16">
          <h3 class="font-enzo text-xl text-utorange lg:text-3xl xl:text-4xl">Lucius</h3>
        </div>
      </div>
      <div class="hidden w-1/3 overflow-hidden md:inline">
        <img src="../images/utsxsw-lucius-tall.png" alt="lucius" class="h-full">
      </div>
    </div>
  </section>
</section>`;
}, "/Users/er35536/repos/utatsxsw-astro/src/components/bands-section.astro");

const $$Astro$j = createAstro();
const $$SessionsSection = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$j, $$props, $$slots);
  Astro2.self = $$SessionsSection;
  return renderTemplate`${maybeRenderHead($$result)}<section class="bg-a bg-cover bg-center bg-no-repeat opacity-95">
  <div class="container md:grid md:w-4/5 md:grid-cols-12 md:py-12 lg:w-11/12">
    <div class="flex flex-col py-4 px-6 md:col-span-6">
      <h3 class="text-md text-center font-eighteeneightythree uppercase text-white">March 6—9, 2023</h3>
      <img src="../images/sxsw-sessions.svg" class="mb-12 mt-3 h-16 lg:mb-16">
      <a href="/sessions-edu" class="w-full cursor-pointer self-center bg-white py-2 text-center font-eighteeneightythree text-sm uppercase text-burntorange transition-colors hover:border-burntorange-dark hover:bg-burntorange-dark hover:text-white hover:no-underline md:px-1 lg:w-4/5 lg:text-lg">
        See UT SXSW EDU Sessions${renderComponent($$result, "Icon", $$Icon, { "class": "mb-1 inline h-8 w-8 fill-current", "name": "mdi:chevron-right" })}
      </a>
    </div>

    <div class="flex flex-col py-4 px-6 md:col-span-6">
      <h3 class="text-md text-center font-eighteeneightythree uppercase text-white">March 10—19, 2023</h3>
      <img src="../images/sxsw-sessions-edu.svg" class="mb-12 mt-3 h-16 lg:mb-16">
      <a href="/sessions" class="w-full cursor-pointer self-center bg-white py-2 text-center font-eighteeneightythree text-sm uppercase text-burntorange transition-colors hover:border-burntorange-dark hover:bg-burntorange-dark hover:text-white hover:no-underline md:px-1 lg:w-4/5 lg:text-lg">
        See UT SXSW Sessions${renderComponent($$result, "Icon", $$Icon, { "class": "mb-1 inline h-8 w-8 fill-current", "name": "mdi:chevron-right" })}
      </a>
    </div>
  </div>
</section>`;
}, "/Users/er35536/repos/utatsxsw-astro/src/components/sessions-section.astro");

const $$Astro$i = createAstro();
const $$LonghornBandSection = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$i, $$props, $$slots);
  Astro2.self = $$LonghornBandSection;
  return renderTemplate`${maybeRenderHead($$result)}<section class="bg-limestone-light bg-c2 bg-cover bg-center bg-no-repeat opacity-95">
  <div class="container grid w-4/5 grid-cols-12 lg:max-w-5xl lg:justify-items-center">
    <div class="col-span-12 mt-16 mb-6 items-start bg-white p-0 md:grid md:grid-cols-12 md:items-center">
      <div class="md:order-2 md:col-span-6">
        <img src="../images/utsxsw-networking.png" alt="Networking">
      </div>
      <div class="order-2 place-self-center p-8 font-eighteeneightythree md:col-span-6">
        <p class="mt-3 mb-3 font-eighteeneightythreeblack text-2xl text-burntorange md:text-3xl lg:text-4xl">Networking</p>
        <p class="text-xl text-ut-charcoal--s40">Investors and entrepreneurs are invited to our dedicated networking space inside the Texas Speakeasy at Banger’s. Attendees will have the opportunity to build connections with UT faculty and student startups and participate in an immersive experience with prizes, including a one-of-kind craft cocktail.</p>
        <a href="/networking" class="burntorange mt-3 block cursor-pointer self-center border-2 border-solid bg-white py-1 px-4 text-center font-eighteeneightythree uppercase text-burntorange transition-colors hover:border-burntorange-dark hover:bg-burntorange-dark hover:text-white hover:no-underline md:w-1/2 md:px-1">
          Details${renderComponent($$result, "Icon", $$Icon, { "class": "mb-1 inline h-8 w-8 fill-current", "name": "mdi:chevron-right" })}
        </a>
      </div>
    </div>
  </div>
  <div class="container grid w-4/5 grid-cols-12 lg:max-w-5xl lg:justify-items-center">
    <div class="col-span-12 mt-6 mb-16 items-start bg-white p-0 md:grid md:grid-cols-12 md:items-center">
      <div class="md:order-2 md:col-span-6">
        <img src="../images/utsxsw-longhorn-band-live.jpg" alt="Longhorn Band and More">
      </div>
      <div class="order-1 place-self-center p-8 font-eighteeneightythree md:col-span-6">
        <p class="mt-3 mb-6 font-eighteeneightythreeblack text-2xl text-burntorange md:text-3xl lg:text-4xl">Longhorn Band and More</p>
        <p class="text-xl text-ut-charcoal--s40">Throughout the day, guests can check out our screen-printing shop, snag a picture with the Longhorn Lamborghini, and enjoy an exuberant performance by the Longhorn Band.</p>
      </div>
    </div>
  </div>
</section>`;
}, "/Users/er35536/repos/utatsxsw-astro/src/components/longhorn-band-section.astro");

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro$h = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$h, $$props, $$slots);
  Astro2.self = $$Index;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Home" }, { "default": ($$result2) => renderTemplate(_a || (_a = __template(["", `<main>
    <section class="mb-[-1.5px] block bg-burntorange pb-1 md:hidden">
      <div class="m-auto my-12 mx-1">
        <img class="m-auto md:order-2 md:col-span-6 xl:max-w-md" src="/images/tower.gif" alt="UT Tower">
      </div>

      <div class="m-9 text-center font-eighteeneightythree text-2xl text-white">
        <p>UT at SXSW</p>
        <p>March 11, 2023</p>
        <p>10 a.m. \u2014 9 p.m.</p>
        <p>Banger's on Rainey St.</p>
      </div>
    </section>

    <section class="hidden justify-center md:mb-[-1px] md:flex md:overflow-hidden">
      <script type="module" src="https://unpkg.com/@splinetool/viewer/build/spline-viewer.js"><\/script>
      `, `
    </section>

    <section class="bg-white">
      <div class="relative pb-10">
        <img class="absolute w-full" src="/images/burntorange-wave.svg" alt="wave">
        <div class="absolute -top-px h-[2px] w-full bg-burntorange"></div>
      </div>
      <div class="container pb-20 md:grid md:grid-cols-12 lg:w-4/5">
        <p class="mx-auto p-9 text-center font-eighteeneightythree text-2xl text-burntorange md:col-span-12 md:mt-9 md:w-4/5 md:text-3xl">As Austin's hub for tech and creativity, The University of Texas at Austin is leading the way in innovation. We're excited to show you how. With impactful panel sessions, a networking space, KUTX recordings, live music and a Burnt Orange Bash &mdash; we're bringing the Longhorn spirit to SXSW.</p>
        <p class="col-span-12 mt-4 text-center font-eighteeneightythreeitalics text-xl text-charcoal">
          Entry to this event is available to SXSW<br> badge holders and invited guests.
        </p>
      </div>
    </section>

    `, "\n    ", "\n    ", "\n    ", "\n    ", "\n\n    ", "\n  </main>"])), maybeRenderHead($$result2), renderComponent($$result2, "spline-viewer", "spline-viewer", { "class": "!h-fit !w-fit", "url": "https://prod.spline.design/eh4TRGCbw1YpdzxE/scene.splinecode" }), renderComponent($$result2, "MyKutxSection", $$MyKutxSection, {}), renderComponent($$result2, "ExpertPanelSection", $$ExpertPanelSection, {}), renderComponent($$result2, "BandsSection", $$BandsSection, {}), renderComponent($$result2, "LonghornBandSection", $$LonghornBandSection, {}), renderComponent($$result2, "SessionsSection", $$SessionsSection, {}), renderComponent($$result2, "SeeYouThere", $$SeeYouThere, { "image": "../images/sxsw-hookem.svg", "date": "March 11, 2023", "time": "10 a.m. \u2014 9 p.m.", "headline": "See You There!", "blurb": "#UTatSXSW" })) })}`;
}, "/Users/er35536/repos/utatsxsw-astro/src/pages/index.astro");

const $$file$c = "/Users/er35536/repos/utatsxsw-astro/src/pages/index.astro";
const $$url$c = "";

const _page1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file$c,
  url: $$url$c
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro$g = createAstro();
const $$ProfileCard = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$g, $$props, $$slots);
  Astro2.self = $$ProfileCard;
  const { name, image, company, bio } = Astro2.props;
  return renderTemplate`${maybeRenderHead($$result)}<div class="col-span-12 mt-16 mb-12 items-start bg-white lg:grid lg:grid-cols-12 lg:items-center">
  <div class="lg:col-span-5">
    <img${addAttribute(image, "src")}${addAttribute(name, "alt")}>
  </div>
  <div class="p-8 font-eighteeneightythree text-charcoal lg:col-span-7 xl:p-16">
    <p class="my-3 font-eighteeneightythreeblack text-3xl lg:text-5xl">
      ${name}
    </p>
    <p class="my-3 text-2xl">${company}</p>
    <p class="my-3">
      ${bio}
    </p>
  </div>
</div>`;
}, "/Users/er35536/repos/utatsxsw-astro/src/components/profile-card.astro");

const $$Astro$f = createAstro();
const $$PageContentHeader = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$f, $$props, $$slots);
  Astro2.self = $$PageContentHeader;
  const { light = false, intro, headline, blurb } = Astro2.props;
  return renderTemplate`${maybeRenderHead($$result)}<section${addAttribute(`relative bg-cover bg-center bg-no-repeat opacity-95 ${light ? "bg-limestone-light bg-c3" : "bg-burntorange bg-b1"}`, "class")}>
  <div class="container grid w-5/6 grid-cols-12 lg:max-w-5xl">
    <div class="col-span-12 my-24 bg-white p-9 md:py-10 lg:px-6">
      <p class="text-center font-eighteeneightythree text-2xl text-burntorange md:text-3xl">
        ${intro}
      </p>
      <h1 class="my-4 text-center font-enzo text-4xl uppercase text-burntorange md:text-7xl">
        ${headline}
      </h1>
      <p class="px-6 text-center font-eighteeneightythree text-lg text-burntorange">
        ${blurb}
      </p>
    </div>
  </div>
</section>`;
}, "/Users/er35536/repos/utatsxsw-astro/src/components/page-content-header.astro");

const $$Astro$e = createAstro();
const $$DiscoveryToImpact = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$e, $$props, $$slots);
  Astro2.self = $$DiscoveryToImpact;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Discovery to Impact" }, { "default": ($$result2) => renderTemplate`${maybeRenderHead($$result2)}<main class="bg-white text-charcoal">
    ${renderComponent($$result2, "PageContentHeader", $$PageContentHeader, { "light": true, "intro": "Discovery to Impact:", "headline": "The Future of Tech? It Looks a Lot Like Austin" })}

    <section class="py-12">
      <div class="container mt-5 text-charcoal lg:w-4/5 lg:max-w-5xl lg:justify-items-center xl:w-3/5">
        <p class="font-eighteeneightythreebold text-4xl">March 11, 2023, 1–2 p.m.</p>
        <p class="my-3 font-eighteeneightythree text-2xl">Austin is a hotbed of innovation. From major global enterprises like Dell, Samsung, and AMD to one of the top entrepreneurship ecosystems in the world, some of the most bleeding-edge, deep-tech innovations start here. This panel discussion will bring together the perspectives of large and small businesses, investors, and innovators in technology areas core to the future of Austin and the United States: semiconductors, energy, life sciences, and space tech.</p>
        <div class="mx-auto mt-9 w-full flex-col md:grid md:w-3/4 md:grid-cols-2 lg:w-1/2">
          <p class="font-eighteeneightythree text-xl uppercase md:pt-1">With Support From</p>
          <img src="../images/Dell-Technologies.svg" class="mt-3 block h-8 md:mt-0">
        </div>
      </div>
    </section>

    <section class="bg-limestone-light bg-c2 bg-cover bg-center bg-no-repeat opacity-95">
      <div class="container grid w-4/5 grid-cols-12 lg:max-w-5xl lg:justify-items-center">
        ${renderComponent($$result2, "ProfileCard", $$ProfileCard, { "image": "../images/people/ut-sxsw-christine-dixon-thesing.png", "name": "Christine Dixon Thiesing", "company": "Moderator - Discovery to Impact, UT Austin", "bio": "Christine Dixon Thiesing is UT Austin\u2019s Discovery to Impact AVP, overseeing a team of experts that brings products & services to market by connecting industry, investors, startups, and UT innovators. She has also worked at CuRE Innovations and the SCRA." })}
        ${renderComponent($$result2, "ProfileCard", $$ProfileCard, { "image": "../images/people/ut-sxsw-cheryl-ingstad.png", "name": "Cheryl Ingstad", "company": "Department of Defense", "bio": "Cheryl Ingstad is the managing director of the National Security Innovation Network (NSIN), a DoD program office that collaborates with major universities and the venture community to develop solutions that drive national security innovation." })}
        ${renderComponent($$result2, "ProfileCard", $$ProfileCard, { "image": "../images/people/ut-sxsw-juli-johnston.png", "name": "Juli Johnston", "company": "Tesla", "bio": "Juli Johnston leads energy procurement and incentive program implementation for Tesla\u2019s global charging network. Previously, she was a Sr. Analyst on Tesla\u2019s Policy Team, Deputy Director of Policy & Electricity Markets for SolarCity, and Analyst at MRW & Associates. Johnston holds degrees from UC Berkeley and UT." })}
        ${renderComponent($$result2, "ProfileCard", $$ProfileCard, { "image": "../images/people/ut-sxsw-john-kozarich.png", "name": "John Kozarich", "company": "C\u016Brza", "bio": "John Kozarich is Chairman of Ligand (LGND) and adjunct professor at UT Austin\u2019s College of Pharmacy. His 45-year career in drug discovery and development has spanned biotech, big pharma, and academia. He has a PhD in biological chemistry from MIT." })}
        ${renderComponent($$result2, "ProfileCard", $$ProfileCard, { "image": "../images/people/ut-sxsw-john-schreck.png", "name": "John Schreck", "company": "Texas Institute for Electronics (TIE)", "bio": "John Schreck is a former Micron Technology SVP and is the newly named CEO of the Texas Institute for Electronics (TIE), a public-private consortium that accelerates innovations in advanced packaging and heterogenous integration." })}
      </div>
    </section>
  </main>` })}`;
}, "/Users/er35536/repos/utatsxsw-astro/src/pages/discovery-to-impact.astro");

const $$file$b = "/Users/er35536/repos/utatsxsw-astro/src/pages/discovery-to-impact.astro";
const $$url$b = "/discovery-to-impact";

const _page2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$DiscoveryToImpact,
  file: $$file$b,
  url: $$url$b
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro$d = createAstro();
const $$NameImageLikeness = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$d, $$props, $$slots);
  Astro2.self = $$NameImageLikeness;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Name, Image, Likeness (NIL)" }, { "default": ($$result2) => renderTemplate`${maybeRenderHead($$result2)}<main class="bg-white text-charcoal">
    ${renderComponent($$result2, "PageContentHeader", $$PageContentHeader, { "light": true, "intro": "Name, Image, Likeness (NIL):", "headline": "How Nil is Changing the Game for College Athletics" })}

    <section class="py-12">
      <div class="container mt-5 text-charcoal lg:w-4/5 lg:max-w-5xl lg:justify-items-center xl:w-3/5">
        <p class="font-eighteeneightythreebold text-4xl">March 11, 2023, 2:30-3:30 p.m.</p>
        <p class="my-3 font-eighteeneightythree text-2xl">In the blink of an eye, Name, Image and Likeness (NIL) has dramatically changed the landscape for NCAA student athletes, institutions, and the ecosystem around them. What’s on the horizon? How should universities, collectives, and businesses better support and protect student-athletes? This expert panel will discuss the issues and what lies ahead.</p>
        <div class="mx-auto mt-9 w-full flex-col md:grid md:w-3/4 md:grid-cols-2 lg:w-1/2">
          <p class="font-eighteeneightythree text-xl uppercase md:pt-1">With Support From</p>
          <img src="../images/UT-McCombs-School-of-Business.svg" class="mt-3 block h-8 md:mt-0">
        </div>
      </div>
    </section>

    <section class="bg-limestone-light bg-c2 bg-cover bg-center bg-no-repeat opacity-95">
      <div class="container grid w-4/5 grid-cols-12 lg:max-w-5xl lg:justify-items-center">
        ${renderComponent($$result2, "ProfileCard", $$ProfileCard, { "image": "../images/people/ut-sxsw-roger-wallace.png", "name": "Roger Wallace", "company": "Moderator - KXAN", "bio": "Roger Wallace is a KXAN sports anchor and color analyst for the Longhorn Football Radio Network. He covered the \u201902 and \u201908 Olympic Games and was voted \u201CBest Sportscaster\u201D by the Texas Associated Press and Austin Chronicle." })}
        ${renderComponent($$result2, "ProfileCard", $$ProfileCard, { "image": "../images/people/ut-sxsw-ricky-brown.png", "name": "Ricky Brown", "company": "Texas Athletics", "bio": "Rick Brown is Texas Athletics\u2019 senior associate AD, overseeing DEI and student-athlete growth and education. As a student-athlete himself in the \u201990s, Brown cleared the lanes for Ricky Williams as his blocking fullback. He holds an MBA from SMU." })}
        ${renderComponent($$result2, "ProfileCard", $$ProfileCard, { "image": "../images/people/ut-sxsw-carol-capitani.png", "name": "Carol Capitani", "company": "Texas Women\u2019s Swimming and Diving", "bio": "Carol Capitani is the head coach of the elite Texas Women\u2019s Swimming and Diving program. She was recently selected by USA Swimming to lead the Women\u2019s National Team at the 2023 World Championships in Japan." })}
        ${renderComponent($$result2, "ProfileCard", $$ProfileCard, { "image": "../images/people/ut-sxsw-lisa-hannusch.png", "name": "Lisa Hannusch", "company": "Texas One Fund", "bio": "Lisa Hannusch is a UT alum, Austin native and board advisor supporting women\u2019s sports to the Texas One Fund, which connects Texas college athletes with charitable causes, helping them cultivate NIL opportunities. As a former CEO, Lisa serves on several public, private and non-profit boards and is an enthusiastic Longhorn Foundation donor." })}
        ${renderComponent($$result2, "ProfileCard", $$ProfileCard, { "image": "../images/people/ut-sxsw-blake-lawrence.png", "name": "Blake Lawrence", "company": "Opendorse", "bio": "Blake Lawrence is the founder and CEO of Opendorse, which serves the full lifecycle of supporting athletes: educating, assessing, planning, sharing, creating, measuring, tracking, disclosing, regulating, listing, browsing, booking, and more. Opendorse\u2019s NIL solutions connect marketers and supporters with athletes while helping athletes understand, build, protect, and monetize their brand value. Prior founding Opendorse, Lawrence attended the University of Nebraska and played three seasons on the Cornhuskers football team, then earned his MBA." })}
      </div>
    </section>
  </main>` })}`;
}, "/Users/er35536/repos/utatsxsw-astro/src/pages/name-image-likeness.astro");

const $$file$a = "/Users/er35536/repos/utatsxsw-astro/src/pages/name-image-likeness.astro";
const $$url$a = "/name-image-likeness";

const _page3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$NameImageLikeness,
  file: $$file$a,
  url: $$url$a
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro$c = createAstro();
const $$BandCard = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$c, $$props, $$slots);
  Astro2.self = $$BandCard;
  const { name, image, bio, bioTwo } = Astro2.props;
  return renderTemplate`${maybeRenderHead($$result)}<div class="mb-16">
  <h3 class="my-3 font-eighteeneightythreeblack text-5xl">
    ${name}
  </h3>
  <div class="mt-3 mb-9 font-eighteeneightythree text-2xl">
    <p>
      ${bio}
    </p>
    <p class="mt-6">
      ${bioTwo}
    </p>
  </div>
  <img${addAttribute(image, "src")}${addAttribute(name, "alt")}>
</div>`;
}, "/Users/er35536/repos/utatsxsw-astro/src/components/band-card.astro");

const $$Astro$b = createAstro();
const $$BurntOrangeBash = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$b, $$props, $$slots);
  Astro2.self = $$BurntOrangeBash;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Burnt Orange Bash" }, { "default": ($$result2) => renderTemplate`${maybeRenderHead($$result2)}<main class="bg-white text-charcoal">
    ${renderComponent($$result2, "PageContentHeader", $$PageContentHeader, { "headline": "Burnt Orange Bash" })}

    <section class="py-12">
      <div class="container w-3/5 text-charcoal lg:max-w-5xl lg:justify-items-center">
        <p class="font-eighteeneightythreebold text-4xl">March 11, 2023, 6–9 p.m.</p>
        ${renderComponent($$result2, "BandCard", $$BandCard, { "image": "../images/The-Selfless-Lovers.jpg", "name": "Nik Parr & The Selfless Lovers", "bio": "The Selfless Lovers are a piano-driven rock n\u2019 roll band from Austin, Texas. The group\u2019s original music draws on classic rock, soul, blues and southern rock influences. The Selfless Lovers are a must-see live act; showcasing an energized retro sound, fantastic musicianship and danceable original songs. The band\u2019s singer even plays saxophone and piano at the same time during the set.", "bioTwo": "The band has released 3 EP\u2019s: Glad To Be Here (2017), The Selfless Lovers (2018), Live From Austin (2019) and debuted their full-length, twelve song album When The Bars Close in the Spring of 2021." })}
        ${renderComponent($$result2, "BandCard", $$BandCard, { "image": "../images/utsxsw-lucius.jpg", "name": "Lucius", "bio": "Featuring a pair of Berklee College of Music voice majors in Jess Wolfe and Holly Laessig, who wear matching hairstyles and outfits to visually complement their serpentine harmonies, Lucius debuted their blend of torchy folk-rock and urban indie pop on a self-titled EP in 2012. The band\u2019s first record to crack the top half of the Billboard 200 was their second full-length, 2016\u2019s Good Grief, which looked to slicker, \u201880s-styled pop without abandoning acoustic balladry. They continued to experiment with a range of influences on albums such as the Brandi Carlile-co-produced Second Nature (2022)." })}
      </div>
    </section>
  </main>` })}`;
}, "/Users/er35536/repos/utatsxsw-astro/src/pages/burnt-orange-bash.astro");

const $$file$9 = "/Users/er35536/repos/utatsxsw-astro/src/pages/burnt-orange-bash.astro";
const $$url$9 = "/burnt-orange-bash";

const _page4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$BurntOrangeBash,
  file: $$file$9,
  url: $$url$9
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro$a = createAstro();
const $$FiresideChat = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$a, $$props, $$slots);
  Astro2.self = $$FiresideChat;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Fireside Chat" }, { "default": ($$result2) => renderTemplate`${maybeRenderHead($$result2)}<main class="bg-white text-charcoal">
    ${renderComponent($$result2, "PageContentHeader", $$PageContentHeader, { "light": true, "intro": "Fireside Chat:", "headline": "Building a Hub of Academic and Business Innovation" })}

    <section class="py-12">
      <div class="container mt-5 text-charcoal lg:w-4/5 lg:max-w-5xl lg:justify-items-center xl:w-3/5">
        <p class="font-eighteeneightythreebold text-4xl">March 11, 2023, 4–5 p.m.</p>
        <p class="my-3 font-eighteeneightythree text-2xl">From Silicon Valley to Cambridge, the highest impact universities are intertwined with strong entrepreneurial and investor communities. In Austin, we have the key ingredients, and we are setting the table for the next wave of impact. This discussion between University of Texas at Austin President Jay Hartzell and venture capitalist Jim Breyer will explore the opportunities unique to this moment and location and outline a framework for seizing them.</p>
        <div class="mx-auto mt-9 w-full flex-col md:grid md:w-3/4 md:grid-cols-2 lg:w-1/2">
          <p class="font-eighteeneightythree text-xl uppercase md:pt-1">With Support From</p>
          <img src="../images/Texas-Capital-Bank.svg" class="mt-3 block h-8 md:mt-0">
        </div>
      </div>
    </section>

    <section class="bg-limestone-light bg-c2 bg-cover bg-center bg-no-repeat opacity-95">
      <div class="container grid w-4/5 grid-cols-12 lg:max-w-5xl lg:justify-items-center">
        ${renderComponent($$result2, "ProfileCard", $$ProfileCard, { "image": "../images/people/ut-sxsw-jim-breyer.png", "name": "Jim Breyer", "company": "Breyer Capital", "bio": "Jim Breyer is founder & CEO of Breyer Capital, a premier VC firm in Austin. He\u2019s been an early investor in tech companies that have completed successful public offerings or mergers, many of which, like Facebook, having returned well over 100x their cost." })}
        ${renderComponent($$result2, "ProfileCard", $$ProfileCard, { "image": "../images/people/ut-sxsw-jay-hartzell.png", "name": "Jay Hartzell", "company": "The University of Texas at Austin", "bio": "As UT\u2019s 30th president, Jay Hartzell has launched a 10-year strategic plan to make UT the world\u2019s highest-impact public research university, amplifying both its service to campus and its ability to address society\u2019s greatest challenges." })}
      </div>
    </section>
  </main>` })}`;
}, "/Users/er35536/repos/utatsxsw-astro/src/pages/fireside-chat.astro");

const $$file$8 = "/Users/er35536/repos/utatsxsw-astro/src/pages/fireside-chat.astro";
const $$url$8 = "/fireside-chat";

const _page5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$FiresideChat,
  file: $$file$8,
  url: $$url$8
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro$9 = createAstro();
const $$SessionsEdu = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$9, $$props, $$slots);
  Astro2.self = $$SessionsEdu;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Sessions EDU" }, { "default": ($$result2) => renderTemplate`${maybeRenderHead($$result2)}<main class="bg-white text-charcoal">
    ${renderComponent($$result2, "PageContentHeader", $$PageContentHeader, { "headline": "UT SXSW EDU Sessions", "intro": "March 6\u20149, 2023", "blurb": "UT Austin faculty, students, alumni and staff are presenting on panels and sessions throughout the SXSW festival. Sessions listed here include individuals with a connection to UT Austin." })}

    <section class="py-12">
      <div class="container">Sessions EDU goes Here</div>
    </section>
  </main>` })}`;
}, "/Users/er35536/repos/utatsxsw-astro/src/pages/sessions-edu.astro");

const $$file$7 = "/Users/er35536/repos/utatsxsw-astro/src/pages/sessions-edu.astro";
const $$url$7 = "/sessions-edu";

const _page6 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$SessionsEdu,
  file: $$file$7,
  url: $$url$7
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro$8 = createAstro();
const $$NetworkingCard = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$8, $$props, $$slots);
  Astro2.self = $$NetworkingCard;
  const { startup, name, link, blurb } = Astro2.props;
  return renderTemplate`${maybeRenderHead($$result)}<div class="pt-10 font-eighteeneightythree">
  <p class="pb-4 text-2xl text-ut-shade--s40">
    ${startup}
  </p>
  <a${addAttribute(link, "href")} target="_blank" rel="noreferrer" class="font-eighteeneightythreeblack text-4xl text-burntorange">
    ${name}${renderComponent($$result, "Icon", $$Icon, { "class": "ml-1 mb-2 inline h-10 w-10 fill-current", "name": "mdi:open-in-new" })}
  </a>
  <p class="pt-4 text-xl text-charcoal">
    ${blurb}
  </p>
  <hr class="mt-10">
</div>`;
}, "/Users/er35536/repos/utatsxsw-astro/src/components/networking-card.astro");

const $$Astro$7 = createAstro();
const $$Networking = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$7, $$props, $$slots);
  Astro2.self = $$Networking;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Networking with UT Startups" }, { "default": ($$result2) => renderTemplate`${maybeRenderHead($$result2)}<main class="bg-white text-charcoal">

    ${renderComponent($$result2, "PageContentHeader", $$PageContentHeader, { "light": true, "headline": "Networking with UT Startups" })}
    
    <section class="pt-12 pb-1">
      <div class="container mt-5 text-charcoal lg:w-4/5 lg:max-w-5xl lg:justify-items-center xl:w-3/5">
        <p class="mt-3 mb-9 font-eighteeneightythree text-2xl">Part of what puts UT on track to be the highest impact public university in the world is our faculty and student entrepreneurs. Their services and inventions cross almost every industry, and they are all raising capital or looking to build a team to bring their technologies to market. Get to know tomorrow’s game-changers today. And remember, you saw ’em here first.</p>
        <p class="mt-3 mb-9 font-eighteeneightythree text-2xl">Want to keep talking to a UT startup after SXSW? <a class="text-burntorange" href="mailto:businessdevelopment@discoveries.utexas.edu">Email us.</a> We can help.</p>
      </div>
    </section>

    <section class="container hidden px-1 lg:w-4/5 lg:max-w-5xl xl:w-3/5">
      <div role="tablist" aria-label="tabs" class="flex flex-wrap border-b border-[#000] transition">
        <button role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1" tabindex="0" class="tab relative h-16 w-1/2 border-b-8 border-utorange px-6 text-2xl font-bold uppercase text-burntorange hover:underline"> 12 – 2:00 P.M.</button>
        <button role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2" tabindex="-1" class="tab relative h-16 w-1/2 border-b-8 border-transparent px-6 text-2xl font-bold uppercase text-charcoal hover:underline"> 2 – 4:00 P.M.</button>
      </div>
      <div class="relative mt-6">
        <div role="tabpanel" id="panel-1" class="tab-panel transition duration-300">
          <p class="self-center text-center font-eighteeneightythreeblack text-3xl text-charcoal-dark">Computing Sciences and Physical Sciences</p>
        </div>
        <div role="tabpanel" id="panel-2" class="tab-panel invisible absolute top-0 opacity-0 transition duration-300">
          <p class="self-center text-center font-eighteeneightythreeblack text-3xl text-charcoal-dark">Life Sciences and Consumer Goods</p>

          ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Faculty Startup", "name": "BioBQ", "link": "https://www.biobqing.com/", "blurb": "Produces beef brisket and other whole cuts of meat by growing cells from cattle in a clean production process instead of from slaughter." })}

          ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Faculty Startup", "name": "ClearCam", "link": "https://www.clearcam-med.com/", "blurb": "Surgeons have obstructed vision 44% of the time. We make a windshield wiper to keep their vision clear 99% of the time. Available now." })}

          ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Faculty Startup", "name": "Jurata Thin Film", "link": "https://juratatf.com/", "blurb": "Jurata\u2019s thin film technology stabilizes vaccines and biologics at ambient temperature, increasing equitable access to lifesaving therapies." })}

          ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Student Startup", "name": "Gazelle Ecosolutions", "link": "https://www.thegazelle.co/", "blurb": "Gazelle is a Shell- and Chevron-backed startup that sprung out of UT Austin\u2019s Digital Landscapes Lab, which helps ranchers optimally stock their land while rewarding them through carbon credits. We started off tackling the massive problem of overgrazing-driven desertification in Africa\u2019s grasslands by developing a free, offline mobile app to calculate carrying capacity and carbon sequestration and setting up carbon offset projects to reward ranchers for the protection of healthy soils." })}

          ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Student Startup", "name": "Longhorn Life Sciences", "link": "https://longhornlifesciences.com/", "blurb": "Longhorn Life Sciences is a MedTech company developing needs-driven solutions to improve patient experience and outcomes. Our technology, the \u201CInfection Detective,\u201D will enable early and objective detection of postoperative surgical site infections. Objective early detection of surgical infections is a major clinical need, and the potential to intervene with low-cost, non-invasive treatments will lead to disruption of the healthcare space and result in improved patient outcomes and increased hospital revenue." })}

          ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Student Startup", "name": "Outmore Living", "link": "https://outmoreliving.com/", "blurb": "Outmore Living is reimagining the future of outdoor spaces by creating the world\u2019s first battery-powered heated outdoor furniture." })}

          ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Student Startup", "name": "Pickle System", "link": "https://www.picklesystem.com/", "blurb": "Pickle System provides standardized, evidence-based, animated video models to teach a large variety of daily living skills (i.e., intimate care, hygiene, domestic skills, community skills) to individuals with autism and developmental disabilities. We offer printable visual aids and data collection sheets. We are a hands-off resource for behavior analysts, special educators, occupational therapists, and parents and caregivers of individuals with disabilities. Our mission is to improve the lives of individuals with disabilities by teaching them skills that allows them to fully access their environment." })}

          ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Student Startup", "name": "Retna Bio", "link": "https://retna.bio/", "blurb": "Retna Bio engineers nature\u2019s sensors to accelerate high throughput screening workflows. We use transcription-factor based biosensors to transduce small molecule concentrations into fluorescent readouts." })}

          ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Student Startup", "name": "Tomahawk Targets", "link": "https://www.tomahawktargetsatx.com/", "blurb": "Tomahawk Targets manufactures a variety of axe-throwing targets that ship across the US. We also offer a mobile axe-throwing trailer experience in Austin and surrounding cities." })}

          ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Student Startup", "name": "Valor", "link": "https://www.youtube.com/watch?v=9sL2TMm7zD8", "blurb": "VALOR is an eye-tracking-based Virtual Reality application that provides ALS patients, such as my father, with autonomy in the form of novel experiences and immersive activities that they are unable to engage in physically." })}
        </div>
      </div>
    </section>

    <section class="bg-white pb-12">
      <div class="container px-5 text-charcoal lg:w-4/5 lg:max-w-5xl lg:justify-items-center xl:w-3/5">
        <div class="flex flex-wrap">
          <div class="w-full">
            <ul role="tablist" aria-label="tabs" class="mb-0 flex list-none flex-row flex-wrap border-b pt-3">
              <li class="-mb-px mr-2 flex-auto text-center last:mr-0">
                <a role="tab" aria-selected="true" aria-controls="panel-1" id="panel-1" tabindex="0" class="tabs block cursor-pointer border-b-8 px-5 py-3 text-2xl font-bold uppercase leading-normal border-utorange text-burntorange"> 12 – 2:00 p.m.</a>
              </li>
              <li class="-mb-px mr-2 flex-auto text-center last:mr-0">
                <a role="tab" aria-selected="false" aria-controls="panel-2" id="panel-2" tabindex="-1" class="tabs block cursor-pointer border-b-8 border-transparent px-5 py-3 text-2xl font-bold uppercase leading-normal text-charcoal"> 2 – 4:00 p.m.</a>
              </li>
            </ul>
            <div class="relative mb-6 flex w-full min-w-0 flex-col break-words">
              <div class="flex-auto py-5">
                <div class="tab-content tab-space">
                  <div role="tabpanel" id="panel-1" class="tab-panel block">
                    <section class="bg-white pb-12">
                      <div class="text-charcoal lg:max-w-5xl lg:justify-items-center">
                        <p class="self-center text-center font-eighteeneightythreeblack text-3xl">Computing Sciences and Physical Sciences</p>
                        ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Faculty Startup", "name": "Celadyne Technologies", "link": "https://www.celadynetech.com/", "blurb": "Accelerating industrial decarbonization with durable fuel cells and cheap green hydrogen. We solve the 50-year-old materials problem to unlock the potential of hydrogen." })}

                        ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Faculty Startup", "name": "ClioVis", "link": "https://cliovis.com/", "blurb": "ClioVis is mind-mapping, timeline, and presentation software ideally suited for understanding and illustrating change over time." })}

                        ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Faculty Startup", "name": "La Luce Cristallina", "link": "https://lalucecristallina.com/", "blurb": "Providing the next generation of high-performance photonic wafers for wholesale, R&D, and prototyping for consumer and defense applications." })}

                        ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Faculty Startup", "name": "Lantha Sensors", "link": "https://www.lanthasensors.com/", "blurb": "Chemical analysis company bringing portable, cost-effective platforms to market, enabling rapid, reliable and accurate field-based testing." })}

                        ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Faculty Startup", "name": "Multi AI", "link": "https://www.multi.ai/", "blurb": "Provides next-generation AI for large volumes of vehicles, such as drones, satellites, and ground vehicles, to operate fully autonomously." })}

                        ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Faculty Startup", "name": "Pike Robotics", "link": "https://www.pikerobotics.com/", "blurb": "Pike Robotics makes inspections of oil & gas storage tanks safer, more accurate, and less costly, helping to reduce greenhouse gas emissions." })}

                        ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Faculty Startup", "name": "TAU Systems", "link": "https://www.tausystems.com/", "blurb": "Compact, room-sized particle accelerators and x-ray lasers for semi-conductors, material science and rational drug design / life sciences." })}

                        ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Student Startup", "name": "hifive", "link": "http://hifivecommunity.com/", "blurb": "Enabling service employees to earn recognition and contactless tips." })}

                        ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Student Startup", "name": "Paradigm Robotics", "link": "https://www.thefirebot.com/", "blurb": "Paradigm Robotics is developing the next generation of advanced and accessible robotic solutions to mitigate risks and solve problems for firefighters and civil workers in dangerous environments." })}

                        ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Student Startup", "name": "STEM Muse", "link": "https://www.stemmuse.com/", "blurb": "STEM Muse is the STEM mentorship network for women. We\u2019re patching the leaky pipeline by connecting women in STEM higher education\u2014 undergraduate students, graduate students, postdoctoral associates, and research staff \u2014 with professionals more advanced in their academic and industry careers. Our mission is to increase the recruitment, retention, and ultimately, the success of women in STEM." })}
                      </div>
                    </section>
                  </div>
                  <div role="tabpanel" id="panel-2" class="tab-panel hidden">
                    <section class="bg-white pb-12">
                      <div class="text-charcoal lg:max-w-5xl lg:justify-items-center">
                        <p class="self-center text-center font-eighteeneightythreeblack text-3xl">Life Sciences and Consumer Goods</p>
                        ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Faculty Startup", "name": "BioBQ", "link": "https://www.biobqing.com/", "blurb": "Produces beef brisket and other whole cuts of meat by growing cells from cattle in a clean production process instead of from slaughter." })}

                        ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Faculty Startup", "name": "ClearCam", "link": "https://www.clearcam-med.com/", "blurb": "Surgeons have obstructed vision 44% of the time. We make a windshield wiper to keep their vision clear 99% of the time. Available now." })}

                        ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Faculty Startup", "name": "Jurata Thin Film", "link": "https://juratatf.com/", "blurb": "Jurata\u2019s thin film technology stabilizes vaccines and biologics at ambient temperature, increasing equitable access to lifesaving therapies." })}

                        ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Student Startup", "name": "Gazelle Ecosolutions", "link": "https://www.thegazelle.co/", "blurb": "Gazelle is a Shell- and Chevron-backed startup that sprung out of UT Austin\u2019s Digital Landscapes Lab, which helps ranchers optimally stock their land while rewarding them through carbon credits. We started off tackling the massive problem of overgrazing-driven desertification in Africa\u2019s grasslands by developing a free, offline mobile app to calculate carrying capacity and carbon sequestration and setting up carbon offset projects to reward ranchers for the protection of healthy soils." })}

                        ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Student Startup", "name": "Longhorn Life Sciences", "link": "https://longhornlifesciences.com/", "blurb": "Longhorn Life Sciences is a MedTech company developing needs-driven solutions to improve patient experience and outcomes. Our technology, the \u201CInfection Detective,\u201D will enable early and objective detection of postoperative surgical site infections. Objective early detection of surgical infections is a major clinical need, and the potential to intervene with low-cost, non-invasive treatments will lead to disruption of the healthcare space and result in improved patient outcomes and increased hospital revenue." })}

                        ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Student Startup", "name": "Outmore Living", "link": "https://outmoreliving.com/", "blurb": "Outmore Living is reimagining the future of outdoor spaces by creating the world\u2019s first battery-powered heated outdoor furniture." })}

                        ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Student Startup", "name": "Pickle System", "link": "https://www.picklesystem.com/", "blurb": "Pickle System provides standardized, evidence-based, animated video models to teach a large variety of daily living skills (i.e., intimate care, hygiene, domestic skills, community skills) to individuals with autism and developmental disabilities. We offer printable visual aids and data collection sheets. We are a hands-off resource for behavior analysts, special educators, occupational therapists, and parents and caregivers of individuals with disabilities. Our mission is to improve the lives of individuals with disabilities by teaching them skills that allows them to fully access their environment." })}

                        ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Student Startup", "name": "Retna Bio", "link": "https://retna.bio/", "blurb": "Retna Bio engineers nature\u2019s sensors to accelerate high throughput screening workflows. We use transcription-factor based biosensors to transduce small molecule concentrations into fluorescent readouts." })}

                        ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Student Startup", "name": "Tomahawk Targets", "link": "https://www.tomahawktargetsatx.com/", "blurb": "Tomahawk Targets manufactures a variety of axe-throwing targets that ship across the US. We also offer a mobile axe-throwing trailer experience in Austin and surrounding cities." })}

                        ${renderComponent($$result2, "NetworkingCard", $$NetworkingCard, { "startup": "Student Startup", "name": "Valor", "link": "https://www.youtube.com/watch?v=9sL2TMm7zD8", "blurb": "VALOR is an eye-tracking-based Virtual Reality application that provides ALS patients, such as my father, with autonomy in the form of novel experiences and immersive activities that they are unable to engage in physically." })}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    
  </main>` })}`;
}, "/Users/er35536/repos/utatsxsw-astro/src/pages/networking.astro");

const $$file$6 = "/Users/er35536/repos/utatsxsw-astro/src/pages/networking.astro";
const $$url$6 = "/networking";

const _page7 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Networking,
  file: $$file$6,
  url: $$url$6
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro$6 = createAstro();
const $$404Test = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$404Test;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Burnt Orange Bash" }, { "default": ($$result2) => renderTemplate`${maybeRenderHead($$result2)}<main class="bg-white text-charcoal">
    ${renderComponent($$result2, "PageContentHeader", $$PageContentHeader, { "headline": "Burnt Orange Bash" })}

    <section class="py-12">
      <div class="container w-3/5 text-charcoal lg:max-w-5xl lg:justify-items-center">
        <p class="font-eighteeneightythreebold text-4xl">March 11, 2023, 6–9 p.m.</p>
        ${renderComponent($$result2, "BandCard", $$BandCard, { "image": "../images/The-Selfless-Lovers.jpg", "name": "Nik Parr & The Selfless Lovers", "bio": "The Selfless Lovers are a piano-driven rock n\u2019 roll band from Austin, Texas. The group\u2019s original music draws on classic rock, soul, blues and southern rock influences. The Selfless Lovers are a must-see live act; showcasing an energized retro sound, fantastic musicianship and danceable original songs. The band\u2019s singer even plays saxophone and piano at the same time during the set.", "bioTwo": "The band has released 3 EP\u2019s: Glad To Be Here (2017), The Selfless Lovers (2018), Live From Austin (2019) and debuted their full-length, twelve song album When The Bars Close in the Spring of 2021." })}
        ${renderComponent($$result2, "BandCard", $$BandCard, { "image": "../images/utsxsw-lucius.jpg", "name": "Lucius", "bio": "Featuring a pair of Berklee College of Music voice majors in Jess Wolfe and Holly Laessig, who wear matching hairstyles and outfits to visually complement their serpentine harmonies, Lucius debuted their blend of torchy folk-rock and urban indie pop on a self-titled EP in 2012. The band\u2019s first record to crack the top half of the Billboard 200 was their second full-length, 2016\u2019s Good Grief, which looked to slicker, \u201880s-styled pop without abandoning acoustic balladry. They continued to experiment with a range of influences on albums such as the Brandi Carlile-co-produced Second Nature (2022)." })}
      </div>
    </section>
  </main>` })}`;
}, "/Users/er35536/repos/utatsxsw-astro/src/pages/404-test.astro");

const $$file$5 = "/Users/er35536/repos/utatsxsw-astro/src/pages/404-test.astro";
const $$url$5 = "/404-test";

const _page8 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$404Test,
  file: $$file$5,
  url: $$url$5
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro$5 = createAstro();
const $$Sessions = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$Sessions;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Sessions" }, { "default": ($$result2) => renderTemplate`${maybeRenderHead($$result2)}<main class="bg-white text-charcoal">
    ${renderComponent($$result2, "PageContentHeader", $$PageContentHeader, { "headline": "UT SXSW Sessions", "intro": "March 10\u201419, 2023", "blurb": "UT Austin faculty, students, alumni and staff are presenting on panels and sessions throughout the SXSW festival. Sessions listed here include individuals with a connection to UT Austin." })}

    <section class="py-12">
      <div class="container">Sessions goes here</div>
    </section>
  </main>` })}`;
}, "/Users/er35536/repos/utatsxsw-astro/src/pages/sessions.astro");

const $$file$4 = "/Users/er35536/repos/utatsxsw-astro/src/pages/sessions.astro";
const $$url$4 = "/sessions";

const _page9 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Sessions,
  file: $$file$4,
  url: $$url$4
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro$4 = createAstro();
const $$MyKutx = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$MyKutx;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "My KUTX" }, { "default": ($$result2) => renderTemplate`${maybeRenderHead($$result2)}<main class="bg-white text-charcoal">
    ${renderComponent($$result2, "PageContentHeader", $$PageContentHeader, { "light": true, "headline": "My KUTX" })}

    <section class="py-12">
      <div class="container mt-5 text-charcoal lg:w-4/5 lg:max-w-5xl lg:justify-items-center xl:w-3/5">
        <p class="font-eighteeneightythreebold text-4xl">March 11, 2023, 10 — 11 a.m.</p>
        <p class="my-3 font-eighteeneightythree text-2xl"><span class="uppercase">Hosted by Art Levy</span><br>Every week we invite our favorite musicians and music lovers to play whatever they want to play. We call it: My KUTX.</p>
      </div>
    </section>

    <section class="bg-limestone-light bg-c2 bg-cover bg-center bg-no-repeat opacity-95">
      <div class="container grid w-4/5 grid-cols-12 lg:max-w-5xl lg:justify-items-center">
        ${renderComponent($$result2, "ProfileCard", $$ProfileCard, { "image": "../images/people/ut-sxsw-tim-league-p.jpeg", "name": "Tim League", "company": "Alamo Drafthouse", "bio": "Tim League graduated from Rice University in 1992 with degrees in Mechanical Engineering and Art/Art History. After a two-year stint at Shell Oil in Bakersfield, California, Tim left the engineering profession and opened up his first movie theater, the Tejon Theater, in east Bakersfield. When that theater closed after a short run in 1995, he and his wife Karrie loaded a truck with 200 seats, a projector, screen, and speakers and headed to Austin, Texas. They founded Alamo Drafthouse in 1997, where as Executive Chairmain League remains committed to providing creative programming and a zero tolerance policy for disruption during the theater experience. League also co-founded Fantastic Fest, the largest genre film festival in the United States, and NEON, the newest powerhouse in US Film Distribution with titles such as COLOSSAL, I, TONYA, and PARASITE." })}
      </div>
    </section>
  </main>` })}`;
}, "/Users/er35536/repos/utatsxsw-astro/src/pages/my-kutx.astro");

const $$file$3 = "/Users/er35536/repos/utatsxsw-astro/src/pages/my-kutx.astro";
const $$url$3 = "/my-kutx";

const _page10 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$MyKutx,
  file: $$file$3,
  url: $$url$3
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro$3 = createAstro();
const $$Card = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$Card;
  const { href, title, body } = Astro2.props;
  return renderTemplate`${maybeRenderHead($$result)}<li class="link-card my-5 astro-DOHJNAO5">
  <a${addAttribute(href, "href")} class="astro-DOHJNAO5">
    <h2 class="astro-DOHJNAO5">
      ${title}
      <span class="astro-DOHJNAO5">&rarr;</span>
    </h2>
    <p class="astro-DOHJNAO5">${unescapeHTML(body)}</p>
  </a>
</li>`;
}, "/Users/er35536/repos/utatsxsw-astro/src/components/Card.astro");

const $$Astro$2 = createAstro();
const $$Index2 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Index2;
  const headers = { "Content-Type": "application/json" };
  const postData = await fetch("https://dev-utatsxsw.pantheonsite.io/graphql", {
    method: "post",
    headers,
    body: JSON.stringify({
      query: `{
              posts {
                nodes {
                  content
                  title
                  excerpt
                  slug
                }
              }
            }`
    })
  }).then((data) => data.json());
  const posts = postData?.data?.posts?.nodes;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Home" }, { "default": ($$result2) => renderTemplate`${maybeRenderHead($$result2)}<main>
    <div class="container">
      ${posts.map((post) => renderTemplate`${renderComponent($$result2, "Card", $$Card, { "href": post.slug, "title": post.title, "body": post.excerpt })}`)}
    </div>
  </main>` })}`;
}, "/Users/er35536/repos/utatsxsw-astro/src/pages/index2.astro");

const $$file$2 = "/Users/er35536/repos/utatsxsw-astro/src/pages/index2.astro";
const $$url$2 = "/index2";

const _page11 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index2,
  file: $$file$2,
  url: $$url$2
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro$1 = createAstro();
const $$404 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$404;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "404" }, { "default": ($$result2) => renderTemplate`${maybeRenderHead($$result2)}<main class="bg-white text-charcoal">
    ${renderComponent($$result2, "PageContentHeader", $$PageContentHeader, { "headline": "404: Not Found", "intro": "Page does not exist" })}
  </main>` })}`;
}, "/Users/er35536/repos/utatsxsw-astro/src/pages/404.astro");

const $$file$1 = "/Users/er35536/repos/utatsxsw-astro/src/pages/404.astro";
const $$url$1 = "/404";

const _page12 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$404,
  file: $$file$1,
  url: $$url$1
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro = createAstro();
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const headers = { "Content-Type": "application/json" };
  const slug = Astro2.params.slug;
  const postData = await fetch("https://dev-utatsxsw.pantheonsite.io/graphql", {
    method: "post",
    headers,
    body: JSON.stringify({
      query: `{
                post(idType: SLUG, id: "${slug}") {
                    content
                    date
                    title
                    id
                    databaseId
                    slug
                    uri
                }
            }`
    })
  }).then((data) => data.json());
  const post = postData?.data?.post;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Home" }, { "default": ($$result2) => renderTemplate`${maybeRenderHead($$result2)}<main class="bg-white py-10">
    <div class="container">
      <h1 class="text-5xl">${post.title}</h1>
      <time>${new Date(post.date).toLocaleString()}</time>
      <article>${unescapeHTML(post.content)}</article>
    </div>
  </main>` })}`;
}, "/Users/er35536/repos/utatsxsw-astro/src/pages/[slug].astro");

const $$file = "/Users/er35536/repos/utatsxsw-astro/src/pages/[slug].astro";
const $$url = "/[slug]";

const _page13 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

export { _page0 as _, _page1 as a, _page2 as b, _page3 as c, _page4 as d, _page5 as e, _page6 as f, _page7 as g, _page8 as h, _page9 as i, _page10 as j, _page11 as k, _page12 as l, _page13 as m };
