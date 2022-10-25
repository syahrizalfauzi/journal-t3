import React from "react";

type KeywordBadgesProps = {
  keywords: {
    keyword: string;
  }[];
};

export const KeywordBadges = ({ keywords }: KeywordBadgesProps) => {
  return (
    <div className="flex flex-wrap gap-1">
      {keywords.map(({ keyword }) => (
        <div className="badge badge-ghost" key={keyword}>
          {keyword}
        </div>
      ))}
    </div>
  );
};
