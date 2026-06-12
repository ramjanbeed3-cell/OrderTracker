import * as signalR from '@microsoft/signalr';

let connection: signalR.HubConnection | null = null;

export const createConnection = (token: string): signalR.HubConnection => {
  connection = new signalR.HubConnectionBuilder()
    .withUrl('/hubs/orders', {
      accessTokenFactory: () => token,
      transport: signalR.HttpTransportType.WebSockets
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();
  return connection;
};

export const getConnection = () => connection;

export const startConnection = async (conn: signalR.HubConnection) => {
  try {
    await conn.start();
    console.log('SignalR Connected');
  } catch (err) {
    console.error('SignalR connection failed:', err);
    setTimeout(() => startConnection(conn), 5000);
  }
};

export const joinOrderGroup = async (orderId: number) => {
  if (connection?.state === signalR.HubConnectionState.Connected)
    await connection.invoke('JoinOrderGroup', orderId.toString());
};

export const leaveOrderGroup = async (orderId: number) => {
  if (connection?.state === signalR.HubConnectionState.Connected)
    await connection.invoke('LeaveOrderGroup', orderId.toString());
};

export const sendDriverLocation = async (lat: number, lng: number, activeOrderId?: number) => {
  if (connection?.state === signalR.HubConnectionState.Connected) {
    await connection.invoke('UpdateDriverLocation', { lat, lng, activeOrderId: activeOrderId || null });
  }
};
