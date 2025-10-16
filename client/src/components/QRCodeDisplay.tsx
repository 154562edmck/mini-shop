"use client";

import { useState, useEffect, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Select, SelectItem } from "@nextui-org/react";

interface QRCodeDisplayProps {
    url: string;
    size?: number;
}

export const QRCodeDisplay = ({ url, size = 200 }: QRCodeDisplayProps) => {
    const [qrColor, setQrColor] = useState("#000000");
    const [qrImageUrl, setQrImageUrl] = useState<string>("");
    const qrRef = useRef<HTMLDivElement>(null);

    const colorOptions = [
        { label: "黑色", value: "#000000" },
        { label: "蓝色", value: "#1677FF" },
        { label: "绿色", value: "#52c41a" }
    ];

    useEffect(() => {
        // 当颜色改变或URL改变时，更新图片
        const canvas = qrRef.current?.querySelector('canvas');
        if (canvas) {
            const imageUrl = canvas.toDataURL('image/png');
            setQrImageUrl(imageUrl);
        }
    }, [qrColor, url]);

    return (
        <div className="flex flex-col items-center gap-2">
            <Select
                label="二维码颜色"
                size="sm"
                value={qrColor}
                onChange={(e) => setQrColor(e.target.value)}
                className="w-48"
            >
                {colorOptions.map((option) => (
                    <SelectItem 
                        key={option.value} 
                        value={option.value}
                        title={option.label}
                    >
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: option.value }}
                            />
                            {option.label}
                        </div>
                    </SelectItem>
                ))}
            </Select>

            <div className="bg-white p-4 rounded-lg">
                {/* 隐藏的 Canvas 用于生成图片 */}
                <div ref={qrRef} style={{ display: 'none' }}>
                    <QRCodeCanvas
                        value={url}
                        size={size}
                        level="H"
                        fgColor={qrColor}
                        bgColor="#FFFFFF"
                        includeMargin={true}
                    />
                </div>
                
                {/* 显示实际的图片 */}
                {qrImageUrl && (
                    <img 
                        src={qrImageUrl}
                        alt="QR Code"
                        style={{
                            width: size,
                            height: size,
                            display: 'block'
                        }}
                    />
                )}
            </div>
        </div>
    );
}; 