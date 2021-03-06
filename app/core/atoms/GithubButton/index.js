import React from 'react';

type Props = {
  user: string,
  style: Object,
  repo: string,
  type: string,
  width: number,
  height: number,
  count: boolean,
  large: boolean
};

const GithubButton = (props: Props) => {
  const { user, style, repo, type, width, height, count, large } = props;
  let src = `https://ghbtns.com/github-btn.html?user=${user}&repo=${repo}&type=${type}`;
  if (count) src += '&count=true';
  if (large) src += '&size=large';

  return (
    <iframe
      src={src}
      frameBorder="0"
      allowTransparency="true"
      scrolling="0"
      width={width}
      height={height}
      style={{ border: 'none', width, height, ...style }}
    />
  );
};

export default GithubButton;
