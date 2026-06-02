import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default async function Icon() {
  const imageData = await fetch(
    new URL('../../public/images/francis_sprite.jpg', import.meta.url)
  ).then((res) => res.arrayBuffer());
  
  // Convert ArrayBuffer to base64
  const imageBase64 = Buffer.from(imageData).toString('base64');
  const src = `data:image/jpeg;base64,${imageBase64}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '22%',
          overflow: 'hidden',
          backgroundColor: '#000',
        }}
      >
        <img
          src={src}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
