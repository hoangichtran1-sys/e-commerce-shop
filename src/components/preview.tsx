/* eslint-disable react-hooks/static-components */
"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

import "react-quill-new/dist/quill.bubble.css";

interface PreviewProps {
    value: string;
}

export const Preview = ({ value }: PreviewProps) => {
    const ReactQuill = useMemo(() => dynamic(() => import("react-quill-new"), { ssr: false }), []);

    return (
        <div className="bg-white shadow-xs -ml-2.5 -mt-3">
            <ReactQuill theme="bubble" value={value} readOnly />
        </div>
    );
};
