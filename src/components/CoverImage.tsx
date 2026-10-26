import React, { useEffect, useState } from 'react';
import { asset, cleanSrc, fallbackOf, isEmojiCover } from '../utils/images';

interface Props {
  cover: string;
  alt: string;
  emojiClassName?: string;
  emojiStyle?: React.CSSProperties;
  imgStyle?: React.CSSProperties;
  emojiFallback?: string;
}

/** Shows an emoji, a remote photo, or a local image. Remote photo -> local SVG fallback -> emoji. */
export const CoverImage: React.FC<Props> = ({
  cover,
  alt,
  emojiClassName,
  emojiStyle,
  imgStyle,
  emojiFallback = '📖',
}) => {
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  useEffect(() => setStage(0), [cover]);

  if (isEmojiCover(cover) || stage === 2) {
    return (
      <span className={emojiClassName} style={emojiStyle}>
        {isEmojiCover(cover) ? cover : emojiFallback}
      </span>
    );
  }

  const fb = fallbackOf(cover);
  const src = stage === 1 && fb ? fb : asset(cleanSrc(cover));

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      style={imgStyle}
      onError={() => setStage(stage === 0 && fb ? 1 : 2)}
    />
  );
};
