import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollSmoother, ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const HeroSection = () => {
  const jokerRef = useRef(null);
  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".trigger",
        start: "-15% 0%",
        end: "bottom bottom",
      },
    });

    tl.from(".heading", {
      width: 0,
      duration:1,
    })
      .from(".hand1", {
        duration: 1,
        width: 0,
        rotateY: -90,
        rotateZ: 90,
        rotateX: -90,
        transformOrigin: "right",
      })
      .from(
        ".hand2",
        {
          width: 0,
          duration: 1,
          rotateY: 90,
          rotateZ: 90,
          rotateX: 90,
          transformOrigin: "left",
        },
        "<",
      )
      .from(
        jokerRef.current,
        {
          position: "absolute",
          top: 10,
          duration: 1,
          clipPath: " polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
          transformOrigin: "bottom",
        },
        "<",
      )
      .from(".desk", {
        duration: 2,
        clipPath: "polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)",
      })
      .to(
        ".heading",
        {
          duration: 2,
          translateY: -115,
        },
        "<",
      )
      .from(
        ".login-button",
        {
          width: 0,
          opacity: 0,
          transformOrigin: "50%",
        },
        "<",
      )
      .to(".login-button", {
        scale: 1.1,
        duration: 0.5,
      });
  }, []);
  return (
    <section className="relative trigger perspective-midrange  shadow-xl shadow-bg-primary border-y-2 border-bg-primary bg-[url('/images/bg-image.jpg')] flex items-center justify-center bg-no-repeat  bg-cover h-screen max-w-screen overflow-hidden w-full">
      <div className="flex translate-y-10 relative flex-col items-center gap-2">
        <h1 className="text-4xl relative heading font-serif bg-linear-70 via-amber-300 from-cyan-200 to-emerald-100 bg-clip-text text-transparent font-[5rem] z-1">
          Welcome to ACE OF SPADES ♠ ️
        </h1>
        <p
          style={{
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          }}
          className="desk w-fit text-nowrap tracking-[1.5rem] z-3 drop-shadow-xl drop-shadow-red-600 uppercase text-neutral-100 font-bold  text-lg"
        >
          Never dies
        </p>
        <img
          style={{
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          }}
          src="/images/joker-spades.png"
          ref={jokerRef}
          className=" absolute h-40 drop-shadow-2xl drop-shadow-cyan-400 -top-20 z-2 "
        />
        <button className="translate-y-20 login-button shadow-md backdrop-blur-lg shadow-amber-300 font-medium w-full text-white max-w-50  p-3 px-5 rounded-4xl bg-transparent">
          Let's Play
        </button>
      </div>
      <img
        src="/images/hand1-spades.png"
        alt=""
        className="hand1 absolute -right-2 top-20 h-15 md:h-30 lg:h-40 xl:h-40 z-0  "
      />
      <img
        src="/images/hand2-spades.png"
        alt=""
        className="absolute hand2 -left-2  bottom-20  h-15 md:h-30 lg:h-40 xl:h-40  z-0"
      />
    </section>
  );
};

export default HeroSection;
