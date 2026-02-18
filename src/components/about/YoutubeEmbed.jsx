export default function YoutubeEmbed({ url }) {
  const getVideoId = (inputUrl) => {
    try {
      const urlObj = new URL(inputUrl);
      if (urlObj.hostname.includes("youtu.be")) {
        return urlObj.pathname.slice(1);
      }
      return urlObj.searchParams.get("v");
    } catch (e) {
      return null;
    }
  };

  const videoId = getVideoId(url);
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    <div className="about-video-wrapper">
      <iframe
        src={embedUrl}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
