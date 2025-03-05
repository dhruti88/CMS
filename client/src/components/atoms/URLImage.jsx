import React from 'react';
import { Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';

const URLImage = ({ src, ...props }) => {
  const [image] = useImage(src);
  return <KonvaImage image={image} {...props} />;
};

export default URLImage;
