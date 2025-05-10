import ApkReader from 'adbkit-apkreader';
import fs from 'fs';

interface ApkMetadata {
  versionCode: number;
  versionName: string;
  packageName: string;
  minSdkVersion?: number;
  targetSdkVersion?: number;
}

/**
 * Extracts metadata from an APK file
 * @param filePath Path to the APK file
 * @returns Object with the APK metadata
 */
export async function extractApkMetadata(filePath: string): Promise<ApkMetadata> {
  try {
    const reader = await ApkReader.open(filePath);
    const manifest = await reader.readManifest();
    
    // Convert Android SDK version to Android OS version
    const minAndroidVersion = sdkToAndroidVersion(manifest.sdk?.minSdkVersion);
    
    return {
      versionCode: manifest.versionCode,
      versionName: manifest.versionName,
      packageName: manifest.package,
      minSdkVersion: manifest.sdk?.minSdkVersion,
      targetSdkVersion: manifest.sdk?.targetSdkVersion
    };
  } catch (error) {
    console.error('Error extracting APK metadata:', error);
    throw new Error('Failed to extract metadata from APK file');
  }
}

/**
 * Converts Android SDK version to Android OS version
 * @param sdkVersion Android SDK version
 * @returns Android OS version as string (e.g., "5.0")
 */
export function sdkToAndroidVersion(sdkVersion?: number): string | undefined {
  if (!sdkVersion) return undefined;
  
  const sdkMap: Record<number, string> = {
    21: '5.0', // Lollipop
    22: '5.1', // Lollipop
    23: '6.0', // Marshmallow
    24: '7.0', // Nougat
    25: '7.1', // Nougat
    26: '8.0', // Oreo
    27: '8.1', // Oreo
    28: '9.0', // Pie
    29: '10.0', // Q
    30: '11.0', // R
    31: '12.0', // S
    32: '12.1', // S
    33: '13.0', // T
    34: '14.0', // U
  };
  
  return sdkMap[sdkVersion] || `${sdkVersion}`;
}