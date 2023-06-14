type DiscordLinkProps = {
  className?: string;
};

export function DiscordLink({ className }: DiscordLinkProps) {
  return (
    <a href="https://discord.com/channels/784442203187314689/1017464344755327108" target="_blank" rel="noreferrer">
      <span className={className}>&nbsp;Discord&nbsp;</span>
    </a>
  );
}
