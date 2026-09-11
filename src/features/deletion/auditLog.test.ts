import { describe, expect, it } from 'vitest';
import { auditLogToCsv, type AuditLogEntry } from './auditLog';
import type { RawGraphDevice } from '../../api/types';

function makeSnapshot(overrides: Partial<RawGraphDevice> = {}): RawGraphDevice {
  return {
    id: 'A',
    deviceName: 'Device-A',
    serialNumber: 'SER0001',
    imei: null,
    meid: null,
    operatingSystem: 'Windows',
    osVersion: '10',
    manufacturer: 'Dell',
    model: 'Latitude',
    lastSyncDateTime: '2026-01-01T00:00:00.000Z',
    enrolledDateTime: '2025-01-01T00:00:00.000Z',
    complianceState: 'compliant',
    managementAgent: 'mdm',
    managedDeviceOwnerType: 'company',
    deviceEnrollmentType: 'windowsAutoEnrollment',
    managementState: 'managed',
    azureADDeviceId: null,
    userPrincipalName: 'a.user@example.com',
    ...overrides,
  };
}

function entry(overrides: Partial<AuditLogEntry> = {}): AuditLogEntry {
  return {
    deviceId: 'A',
    deviceName: 'Device-A',
    serialNumber: 'SER0001',
    imei: null,
    matchedOn: 'serial',
    previousLastSync: '2026-01-01T00:00:00.000Z',
    action: 'retire',
    timestamp: '2026-01-01T00:00:00.000Z',
    outcome: 'success',
    deviceSnapshot: makeSnapshot(),
    ...overrides,
  };
}

describe('auditLogToCsv', () => {
  it('renders a professional "Delete"/"Factory reset" label, not the raw action enum', () => {
    const csv = auditLogToCsv([entry({ action: 'retire' }), entry({ action: 'factory-reset' })]);
    const [header, row1, row2] = csv.split('\n');
    expect(header).toContain('Action');
    expect(row1).toContain('Delete');
    expect(row1).not.toContain('retire');
    expect(row2).toContain('Factory reset');
    expect(row2).not.toContain('factory-reset');
  });

  it('flattens the device snapshot into its own named columns instead of an embedded JSON blob', () => {
    const csv = auditLogToCsv([
      entry({ deviceSnapshot: makeSnapshot({ operatingSystem: 'iOS', userPrincipalName: 'b.user@example.com' }) }),
    ]);
    const [header, row1] = csv.split('\n');

    expect(header).toContain('operatingSystem');
    expect(header).toContain('userPrincipalName');
    expect(header).not.toContain('deviceSnapshot');

    expect(row1).toContain('iOS');
    expect(row1).toContain('b.user@example.com');
    expect(row1).not.toMatch(/[{}]/); // no embedded JSON left in any cell
  });
});
