interface ConnectionStatusProps {
  connected: boolean;
  clientCount: number;
}

export function ConnectionStatus({ connected, clientCount }: ConnectionStatusProps) {
  return (
    <div className={`ui-conn ui-conn--${connected ? "on" : "off"}`}>
      <span className="ui-conn__dot" />
      <span className="ui-conn__label">
        {connected ? `Live · ${clientCount} connected` : "Reconnecting…"}
      </span>
    </div>
  );
}
