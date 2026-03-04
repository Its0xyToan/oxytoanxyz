"use client";

import { useRef, useState } from "react";
import { useScroll, useTransform } from "motion/react";
import Header from "@/components/Header";
import LanguagesToolsSection from "@/components/LanguagesToolsSection";

export default function MainPage() {
    const [isDiscordCopied, setDiscordCopied] = useState(false)
    const [isMailCopied, setMailCopied] = useState(false)
    const heroRef = useRef<HTMLDivElement | null>(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"],
    });

    const starsOpacity = useTransform(scrollYProgress, [0, 0.82], [1, 0]);

    const copyText = async (textToCopy: string, setCopied: Function) => {
        
        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            // Reset the "copied" status after a few seconds
            setTimeout(() => setCopied(false), 2000);
          } catch (err) {
            console.error('Failed to copy text: ', err);
          }
    }

    const copyMail = async () => {
        copyText("xyz.oxytoan@gmail.com", setMailCopied)
    }

    const copyDiscord = async () => {
        copyText("oxytoan", setDiscordCopied)
    }

    return (
        <main className="bg-[#02040a] text-slate-100">
            <ul id="links" className="links z-50">
                <li><a className="github" href="https://github.com/Its0xyToan" target="_blank">Github</a></li>
                <li><button className="mail" onClick={copyMail}>{isMailCopied ? "Copied" : "Mail"}</button></li>
                <li><button className="discord" onClick={copyDiscord}>{isDiscordCopied ? "Copied" : "Discord"}</button></li>
            </ul>
            <div ref={heroRef}>
                <Header starsOpacity={starsOpacity} />
            </div>
        
            {/* <LanguagesToolsSection /> */}
        </main>
    );
}
