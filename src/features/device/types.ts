// 장치(device) 도메인 타입 — 백엔드 DTO 와 1:1 매핑.
// DeviceStatus enum: ACTIVE | INACTIVE (백엔드 entity). mqttTopic 은 백엔드 자동 생성 — 등록 요청에 미포함.

export type DeviceStatus = "ACTIVE" | "INACTIVE";

/** GET /api/v1/devices 목록 응답 항목. */
export interface DeviceListItem {
  id: number;
  name: string;
  deviceType: string;
  serialNumber: string | null;
  mqttTopic: string | null;
  zoneId: number;
  zoneName: string;
  status: DeviceStatus;
  createdAt: string;
}

/** GET /api/v1/devices/{id} 상세 응답. */
export interface DeviceDetail {
  id: number;
  name: string;
  deviceType: string;
  serialNumber: string | null;
  mqttTopic: string | null;
  status: DeviceStatus;
  zoneId: number;
  zoneName: string;
  createdAt: string;
  updatedAt: string | null;
}

/** POST /api/v1/devices 요청. mqttTopic 은 백엔드 자동 생성. */
export interface DeviceCreateRequest {
  zoneId: number;
  name: string;
  deviceType: string;
  serialNumber?: string | null;
  status?: DeviceStatus;
}

/** POST /api/v1/devices 응답. */
export interface DeviceCreateResponse {
  id: number;
  name: string;
  deviceType: string;
  serialNumber: string | null;
  mqttTopic: string | null;
  zoneId: number;
  zoneName: string;
  status: DeviceStatus;
  createdAt: string;
}

/** PUT /api/v1/devices/{id} 요청. */
export interface DeviceUpdateRequest {
  name?: string;
  deviceType?: string;
  serialNumber?: string | null;
  status?: DeviceStatus;
  zoneId?: number;
}

/** PUT /api/v1/devices/{id} 응답. */
export interface DeviceUpdateResponse {
  id: number;
  name: string;
  deviceType: string;
  serialNumber: string | null;
  mqttTopic: string | null;
  zoneId: number;
  zoneName: string;
  status: DeviceStatus;
  updatedAt: string;
}
