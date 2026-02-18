import React from 'react';

interface FallbackImageProps {
    src?: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    style?: React.CSSProperties;
}

export const FallbackImage: React.FC<FallbackImageProps> = ({
    src,
    alt,
    width = 300,
    height = 300,
    className,
    style
}) => {
    const fallbackSvg = `data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22${width}%22 height=%22${height}%22%3E%3Crect fill=%22%23e0e0e0%22 width=%22${width}%22 height=%22${height}%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-size=%2214%22 font-family=%22Arial%22%3E${encodeURIComponent(alt)}%3C/text%3E%3C/svg%3E`;

    const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = fallbackSvg;
        e.currentTarget.style.backgroundColor = '#f5f5f5';
    };

    return (
        <img
            src={src || fallbackSvg}
            alt={alt}
            width={width}
            height={height}
            className={className}
            style={style}
            onError={handleError}
        />
    );
};

export default FallbackImage;
