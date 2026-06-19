import { useEffect, useRef } from "react";
import style from "./ToggleBtn.module.css";

const animationStyle: KeyframeAnimationOptions = {
    duration: 200,
    fill: "forwards",
    easing: "cubic-bezier(0.075, 0.82, 0.165, 1)"
};

export default function ToggleBtn({ value, onChange }: { value: boolean, onChange: (value: boolean) => void }) {
    const container_ref = useRef<HTMLDivElement>(null);
    const handle_ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value) {
            handle_ref.current?.animate({
                transform: "translateX(40px)"
            }, animationStyle);

            container_ref.current?.animate({
                backgroundColor: "rgb(45, 227, 100)"
            }, animationStyle);
        }
        else {
            handle_ref.current?.animate({
                transform: "translateX(0px)"
            }, animationStyle);

            container_ref.current?.animate({
                backgroundColor: "rgb(255, 52, 130)"
            }, animationStyle);
        }
    }, [value]);

    return (
        <div ref={container_ref} className={style.container} onClick={() => onChange(!value)}>
            <div ref={handle_ref} className={style.handle}></div>
        </div>
    );
}