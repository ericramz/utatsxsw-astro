import React, { useState } from "react"
import { faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { faChevronDown } from "@fortawesome/free-solid-svg-icons"
import { faChevronUp } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import "@fortawesome/fontawesome-svg-core/styles.css"

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
          <FontAwesomeIcon className="ml-1" icon={isOpen ? faChevronUp : faChevronDown} />
        </button>
        <div className={`z-100 menu-overlay h-0 w-full overflow-hidden border-0 bg-white opacity-0 drop-shadow-xl transition-all md:absolute md:right-0 md:w-72 lg:left-0 ${isOpen ? "is-open h-fit opacity-100" : ""}`}>
          <ul className="min-w-[20rem]">
            <li className="cursor-default bg-limestone-light p-3 uppercase text-charcoal">Saturday, March 11, 2023</li>
            <ul>
              <li className="">
                <a className="block pt-3 pr-3 pb-3 pl-6 text-burntorange transition-colors hover:bg-burntorange-dark hover:text-white hover:no-underline" href="/my-kutx">
                  My KUTX Live
                  <FontAwesomeIcon className="ml-1" icon={faChevronRight} />
                </a>
              </li>
              <li className="cursor-default text-charcoal">
                <span className="pl-6 pb-3">UT Expert Panel Sessions:</span>
                <ul className="cursor-pointer">
                  <li>
                    <a className="block py-1.5 pl-9 text-burntorange transition-colors hover:bg-burntorange-dark hover:text-white hover:no-underline" href="/discovery-to-impact">
                      Discovery to Impact
                      <FontAwesomeIcon className="ml-1" icon={faChevronRight} />
                    </a>
                  </li>
                  <li>
                    <a className="block py-1.5 pr-9 pl-9 text-burntorange transition-colors hover:bg-burntorange-dark hover:text-white hover:no-underline" href="/name-image-likeness">
                      Name, Image, Likeness (NIL)
                      <FontAwesomeIcon className="ml-1" icon={faChevronRight} />
                    </a>
                  </li>
                  <li>
                    <a className="block py-1.5 pl-9 text-burntorange transition-colors hover:bg-burntorange-dark hover:text-white hover:no-underline" href="/fireside-chat">
                      Fireside Chat
                      <FontAwesomeIcon className="ml-1" icon={faChevronRight} />
                    </a>
                  </li>
                </ul>
              </li>
              <li>
                <a className="block pt-3 pr-3 pb-3 pl-6 text-burntorange transition-colors hover:bg-burntorange-dark hover:text-white hover:no-underline" href="/burnt-orange-bash">
                  Burnt Orange Bash
                  <FontAwesomeIcon className="ml-1" icon={faChevronRight} />
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
          <FontAwesomeIcon className="ml-1" icon={isTwoOpen ? faChevronUp : faChevronDown} />
        </button>
        <div className={`menu-overlay h-0 w-full overflow-hidden bg-white opacity-0 drop-shadow-xl transition-all md:absolute md:w-fit  ${isTwoOpen ? "is-open h-fit opacity-100" : ""}`}>
          <ul className="list-none">
            <li className="cursor-default bg-limestone-light p-3 uppercase text-charcoal">March 6—19, 2023</li>
            <ul>
              <li>
                <a className="block pt-3 pr-3 pb-3 pl-3 text-burntorange transition-colors hover:bg-burntorange-dark hover:text-white hover:no-underline" href="/sessions-edu">
                  All UT SXSW EDU Sessions
                  <FontAwesomeIcon className="ml-1" icon={faChevronRight} />
                </a>
              </li>
              <li>
                <a className="block pt-3 pr-3 pb-3 pl-3 text-burntorange transition-colors hover:bg-burntorange-dark hover:text-white hover:no-underline" href="/sessions">
                  All UT SXSW Sessions
                  <FontAwesomeIcon className="ml-1" icon={faChevronRight} />
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
