import React, { useState } from "react"

const Navi = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isTwoOpen, setIsTwoOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }
  const toggleTwoMenu = () => {
    setIsTwoOpen(!isTwoOpen)
  }
  const closeMenu = () => {
    setIsOpen(false)
  }
  const closeTwoMenu = () => {
    setIsTwoOpen(false)
  }

  return (
    <div className="mx-5 font-eighteeneightythree md:col-span-9 md:mx-0 md:grid md:grid-cols-6 md:justify-items-center md:gap-6 lg:grid-cols-12 lg:justify-items-end">
      <div className="group relative md:col-span-2 md:col-start-2 lg:col-span-1 lg:col-start-6 xl:col-start-8" onMouseLeave={closeMenu} role="button" tabIndex="0">
        <button
          className="text-md block w-full cursor-pointer self-center whitespace-nowrap bg-burntorange py-3 px-4 uppercase text-white transition-colors
            hover:text-white hover:no-underline group-hover:bg-burntorange-dark lg:text-lg"
          onClick={toggleMenu}
        >
          March 11 Event
          <svg class="mb-1 ml-1 inline-block fill-current" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 448 512">
            <path d={isOpen ? "M201.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 173.3 54.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z" : "M201.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 338.7 54.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"} />
          </svg>
        </button>
        <div className={`z-100 menu-overlay h-0 w-full overflow-hidden border-0 bg-white opacity-0 drop-shadow-xl transition-all md:absolute md:right-0 md:w-72 lg:left-0 ${isOpen ? "is-open h-fit opacity-100" : ""}`}>
          <ul className="min-w-[20rem]">
            <li className="cursor-default bg-limestone-light p-3 uppercase text-charcoal">Saturday, March 11, 2023</li>
            <ul>
              <li className="">
                <a className="block pt-3 pr-3 pb-3 pl-6 text-burntorange transition-colors hover:bg-burntorange-dark hover:text-white hover:no-underline" href="/my-kutx">
                  My KUTX Live
                  <svg class="mb-1  inline fill-current" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 320 512">
                    <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
                  </svg>
                </a>
              </li>
              <li className="cursor-default text-charcoal">
                <span className="pl-6 pb-3">UT Expert Panel Sessions:</span>
                <ul className="cursor-pointer">
                  <li>
                    <a className="block py-1.5 pl-9 text-burntorange transition-colors hover:bg-burntorange-dark hover:text-white hover:no-underline" href="/discovery-to-impact">
                      Discovery to Impact
                      <svg class="mb-1  inline fill-current" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 320 512">
                        <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a className="block py-1.5 pr-9 pl-9 text-burntorange transition-colors hover:bg-burntorange-dark hover:text-white hover:no-underline" href="/name-image-likeness">
                      Name, Image, Likeness (NIL)
                      <svg class="mb-1  inline-block fill-current" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 320 512">
                        <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a className="block py-1.5 pl-9 text-burntorange transition-colors hover:bg-burntorange-dark hover:text-white hover:no-underline" href="/fireside-chat">
                      Fireside Chat
                      <svg class="mb-1  inline fill-current" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 320 512">
                        <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
                      </svg>
                    </a>
                  </li>
                </ul>
              </li>
              <li>
                <a className="block pt-3 pr-3 pb-3 pl-6 text-burntorange transition-colors hover:bg-burntorange-dark hover:text-white hover:no-underline" href="/burnt-orange-bash">
                  Burnt Orange Bash
                  <svg class="mb-1  inline fill-current" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 320 512">
                    <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
                  </svg>
                </a>
              </li>
            </ul>
          </ul>
        </div>
      </div>
      <div className="group col-end-13 md:col-span-3 lg:col-start-9 xl:col-start-10" onMouseLeave={closeTwoMenu} role="button" tabIndex="0">
        <button
          className="text-md w-full cursor-pointer whitespace-nowrap bg-burntorange py-3 px-4 font-eighteeneightythree uppercase text-white transition-colors hover:text-white hover:no-underline
            group-hover:bg-burntorange-dark lg:text-lg"
          onClick={toggleTwoMenu}
        >
          UT SXSW Sessions
          <svg class="mb-1 ml-1 inline-block fill-current" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 448 512">
            <path d={isTwoOpen ? "M201.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 173.3 54.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z" : "M201.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 338.7 54.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"} />
          </svg>
        </button>
        <div className={`menu-overlay h-0 w-full overflow-hidden bg-white opacity-0 drop-shadow-xl transition-all md:absolute md:w-fit  ${isTwoOpen ? "is-open h-fit opacity-100" : ""}`}>
          <ul className="list-none">
            <li className="cursor-default bg-limestone-light p-3 uppercase text-charcoal">March 6—19, 2023</li>
            <ul>
              <li>
                <a className="block pt-3 pr-3 pb-3 pl-3 text-burntorange transition-colors hover:bg-burntorange-dark hover:text-white hover:no-underline" href="/sessions-edu">
                  All UT SXSW EDU Sessions
                  <svg class="mb-1  inline fill-current" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 320 512">
                    <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
                  </svg>
                </a>
              </li>
              <li>
                <a className="block pt-3 pr-3 pb-3 pl-3 text-burntorange transition-colors hover:bg-burntorange-dark hover:text-white hover:no-underline" href="/sessions">
                  All UT SXSW Sessions
                  <svg class="mb-1  inline fill-current" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 320 512">
                    <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
                  </svg>
                </a>
              </li>
            </ul>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Navi
