import { BlobReader, ZipReader, TextWriter, BlobWriter } from '@zip.js/zip.js';

// Define interface for APK metadata
export interface ApkMetadata {
  appName?: string;
  versionName?: string;
  versionCode?: number;
  packageName?: string;
  minSdkVersion?: number;
}

/**
 * Extracts metadata from an APK file in the browser
 * @param apkFile The APK file object
 * @returns Promise with the APK metadata
 */
export async function extractApkMetadata(apkFile: File): Promise<ApkMetadata> {
  const metadata: ApkMetadata = {};
  
  try {
    console.log('Starting APK extraction for file:', apkFile.name);
    
    // Read APK file (which is a ZIP file)
    const reader = new ZipReader(new BlobReader(apkFile));
    console.log('Created ZIP reader');
    
    const entries = await reader.getEntries();
    console.log('Found entries in ZIP:', entries.length);
    
    // Log all entries for debugging
    const entryNames = entries.map(e => e.filename).slice(0, 20); // First 20 for brevity
    console.log('Sample entries:', entryNames);
    
    // Find the AndroidManifest.xml file
    const manifestEntry = entries.find(entry => entry.filename === 'AndroidManifest.xml');
    console.log('Manifest entry found:', !!manifestEntry);
    
    if (!manifestEntry) {
      throw new Error('AndroidManifest.xml not found in the APK');
    }
    
    // For parsing the binary XML, we can extract some basic info 
    // Note: Full binary XML parsing is complex, so we look for patterns
    
    // Get the manifest content
    let manifestText = '';
    try {
      // Use BlobWriter to get manifest as a blob first
      console.log('Trying to extract manifest using BlobWriter');
      const blobWriter = new BlobWriter();
      const blob = await manifestEntry.getData?.(blobWriter);
      if (blob) {
        // Get the manifest as a blob
        const manifestBlob = blob as Blob;
        console.log('Got manifest blob, size:', manifestBlob.size);
        
        // Check for binary XML format (AXML) - first bytes should be 0x03, 0x00, 0x08, 0x00 for binary XML
        const buffer = await manifestBlob.arrayBuffer();
        const firstBytes = new Uint8Array(buffer, 0, 4);
        const isBinaryXml = (firstBytes[0] === 0x03 && firstBytes[1] === 0x00 && 
                              firstBytes[2] === 0x08 && firstBytes[3] === 0x00);
        
        console.log('First bytes:', Array.from(firstBytes), 'isBinaryXml:', isBinaryXml);
        
        if (isBinaryXml) {
          console.log('Binary XML detected, using advanced extraction techniques');
          
          // For binary XML, we use pattern matching and advanced string extraction techniques
          const textEncoder = new TextDecoder('utf-8');
          const bufferString = textEncoder.decode(buffer);
          
          console.log('Binary buffer string length:', bufferString.length);
          
          // Create cleaned version of buffer with non-printable chars replaced by spaces
          // This makes pattern matching easier and more reliable
          const cleanedBuffer = bufferString.replace(/[^\x20-\x7E]/g, ' ');
          console.log('Sample of cleaned buffer:', cleanedBuffer.substring(0, 100));
          
          // Helper functions for extraction
          
          // Helper to find the first match from multiple patterns
          const findFirstMatch = (patterns: RegExp[], buffer: string): string | undefined => {
            for (const pattern of patterns) {
              const match = buffer.match(pattern);
              if (match && match[1]) {
                console.log(`Found match with pattern ${pattern}:`, match[1]);
                return match[1];
              }
            }
            return undefined;
          };
          
          // Helper to find and convert to number
          const findFirstMatchAsNumber = (patterns: RegExp[], buffer: string): number | undefined => {
            const match = findFirstMatch(patterns, buffer);
            return match ? parseInt(match, 10) : undefined;
          };
          
          // Extract metadata using multiple patterns for each field
          
          // Package name patterns - try multiple approaches
          const packagePatterns = [
            // Look for package="com.example.app" pattern in manifest
            /package="([a-zA-Z0-9_.]+)"/,
            // Look for android:name="package" pattern
            /android:name="package"[^"]*"([a-zA-Z0-9_.]+)"/,
            // Standard Android package pattern with 2+ segments
            /([a-z][a-z0-9_]*\.){2,}[a-z][a-z0-9_]*/i,
            // More permissive package pattern
            /([a-zA-Z0-9_]{2,}\.){2,}[a-zA-Z0-9_]{2,}/
          ];
          
          // App name patterns
          const appNamePatterns = [
            // Look for app_name in strings resources
            /app_name[^>]*>([^<]+)</,
            // Look for android:label= attribute in application tag
            /<application[^>]*android:label="([^"]+)"/,
            // Look for android:label= attribute
            /android:label="([^"]+)"/
          ];
          
          // Version patterns
          const versionPatterns = [
            // Look for versionName= attribute
            /versionName="([^"]+)"/,
            // Look for android:versionName=
            /android:versionName="([^"]+)"/,
            // Match version numbers like 1.0.0
            /\bversion[^0-9]*(\d+\.\d+(\.\d+)?)/i
          ];
          
          // Version code patterns
          const versionCodePatterns = [
            // Look for versionCode= attribute
            /versionCode="(\d+)"/,
            // Look for android:versionCode=
            /android:versionCode="(\d+)"/
          ];
          
          // Min SDK patterns
          const minSdkPatterns = [
            // Look for minSdkVersion= attribute
            /minSdkVersion="(\d+)"/,
            // Look for android:minSdkVersion=
            /android:minSdkVersion="(\d+)"/,
            // Look for <uses-sdk android:minSdkVersion=
            /<uses-sdk[^>]*android:minSdkVersion="(\d+)"/
          ];
          
          // Apply extraction for each metadata field
          
          // Extract package name
          let packageName = findFirstMatch(packagePatterns, cleanedBuffer);
          if (packageName) {
            console.log('Extracted package name:', packageName);
            metadata.packageName = packageName;
          }
          
          // If we still don't have a package name, try alternative methods
          if (!metadata.packageName) {
            // Try to find strings that look like package names by scanning whole buffer
            const packageNameCandidates = cleanedBuffer.match(/([a-zA-Z0-9_]{2,}\.){2,}[a-zA-Z0-9_]{2,}/g) || [];
            console.log('Found package name candidates:', packageNameCandidates.slice(0, 5));
            
            if (packageNameCandidates.length > 0) {
              // Filter for valid package names
              const validPackages = packageNameCandidates.filter(p => 
                p.includes('.') && 
                !p.startsWith('.') && 
                !p.endsWith('.') && 
                p.length > 5 && 
                /^[a-z0-9_.]+$/i.test(p) &&
                p.split('.').length >= 2
              );
              
              if (validPackages.length > 0) {
                console.log('Valid package candidates:', validPackages.slice(0, 3));
                // Prefer package names with more segments
                validPackages.sort((a, b) => b.split('.').length - a.split('.').length);
                metadata.packageName = validPackages[0];
                console.log('Selected package name:', metadata.packageName);
              }
            }
          }
          
          // Look for the string "package=" which might appear near the package name
          if (!metadata.packageName) {
            const packageMarkerIndex = bufferString.indexOf('package=');
            if (packageMarkerIndex > -1) {
              // Extract the 100 characters after "package="
              const packageContext = bufferString.substring(packageMarkerIndex, packageMarkerIndex + 100);
              console.log('Found package marker, context:', packageContext.replace(/[^\x20-\x7E]/g, '.'));
              
              // Look for package name pattern in this context
              const packageMatch = packageContext.match(/package="([^"]+)"/);
              if (packageMatch && packageMatch[1]) {
                console.log('Extracted package name from marker:', packageMatch[1]);
                metadata.packageName = packageMatch[1];
              } else {
                // Try another pattern with more relaxed matching
                const contextMatch = packageContext.match(/([a-z][a-z0-9_]*\.){1,}[a-z][a-z0-9_]*/i);
                if (contextMatch) {
                  console.log('Found package name from context:', contextMatch[0]);
                  metadata.packageName = contextMatch[0];
                }
              }
            }
          }
          
          // Extract app name
          const appName = findFirstMatch(appNamePatterns, cleanedBuffer);
          if (appName) {
            console.log('Extracted app name:', appName);
            metadata.appName = appName;
          }
          
          // If we don't have an app name yet, try searching for common patterns
          if (!metadata.appName) {
            // Try to find app_name pattern in the binary data
            const appNameKeywords = [
              'app_name',
              'application_name',
              'title',
              'game_title',
              'product_name',
              'app_title'
            ];
            
            for (const keyword of appNameKeywords) {
              if (!metadata.appName) {
                const idx = cleanedBuffer.toLowerCase().indexOf(keyword.toLowerCase());
                if (idx > 0) {
                  console.log(`Found ${keyword} marker at index ${idx}`);
                  // Look at 200 chars after this marker
                  const nearby = cleanedBuffer.substring(idx, idx + 200);
                  console.log(`Text near ${keyword}:`, nearby);
                  
                  // Extract content between tags or quotes
                  const nameMatch = nearby.match(/>([^<]+)</);
                  if (nameMatch && nameMatch[1] && nameMatch[1].trim().length > 2) {
                    metadata.appName = nameMatch[1].trim();
                    console.log(`Found app name near ${keyword}:`, metadata.appName);
                    break;
                  }
                  
                  // Try finding quoted strings
                  const quotedMatch = nearby.match(/"([^"]{3,30})"/);
                  if (quotedMatch && quotedMatch[1] && quotedMatch[1].trim().length > 2) {
                    metadata.appName = quotedMatch[1].trim();
                    console.log(`Found quoted app name near ${keyword}:`, metadata.appName);
                    break;
                  }
                }
              }
            }
          }
          
          // Extract version name - critical field, try multiple approaches
          let versionFound = false;
          
          // First approach: Use regular patterns
          const versionName = findFirstMatch(versionPatterns, cleanedBuffer);
          if (versionName) {
            console.log('Extracted version name:', versionName);
            metadata.versionName = versionName;
            versionFound = true;
          } 
          
          // Second approach: Look for version numbers that match common patterns
          if (!versionFound) {
            // Look for \d+\.\d+(\.\d+)? pattern (e.g., 1.0, 2.3.4)
            const versionNamePattern = /\d+\.\d+(\.\d+)?/g;
            const possibleVersions = cleanedBuffer.match(versionNamePattern);
            if (possibleVersions && possibleVersions.length > 0) {
              // Filter out versions that are likely not app versions
              const likelyVersions = possibleVersions.filter(v => 
                // Most app versions are between 0.1 and 20.0
                parseFloat(v) < 20 && 
                parseFloat(v) > 0.1 &&
                // Common app versions have 1-3 segments
                v.split('.').length <= 3
              );
              
              if (likelyVersions.length > 0) {
                metadata.versionName = likelyVersions[0];
                console.log('Found version name pattern:', metadata.versionName);
                versionFound = true;
              } else if (possibleVersions.length > 0) {
                // If all filtered out, still use first match
                metadata.versionName = possibleVersions[0];
                console.log('Using first version-like pattern:', metadata.versionName);
                versionFound = true;
              }
            }
          }
          
          // Third approach: Look for "version" keyword and nearby numbers
          if (!versionFound) {
            const versionIndexes = [
              cleanedBuffer.indexOf('version='),
              cleanedBuffer.indexOf('Version='),
              cleanedBuffer.indexOf('VERSION='),
              cleanedBuffer.indexOf('android:versionName'),
              cleanedBuffer.indexOf('versionName')
            ];
            
            for (const idx of versionIndexes) {
              if (idx > 0) {
                const nearbyText = cleanedBuffer.substring(idx, idx + 100);
                console.log(`Found version marker at ${idx}, context:`, nearbyText.substring(0, 50));
                
                // Look for quoted version
                const quotedMatch = nearbyText.match(/"([0-9.]+)"/);
                if (quotedMatch && quotedMatch[1]) {
                  metadata.versionName = quotedMatch[1];
                  console.log('Found quoted version:', metadata.versionName);
                  versionFound = true;
                  break;
                }
                
                // Look for any version-like pattern
                const versionMatch = nearbyText.match(/[0-9]+\.[0-9.]+/);
                if (versionMatch) {
                  metadata.versionName = versionMatch[0];
                  console.log('Found version near keyword:', metadata.versionName);
                  versionFound = true;
                  break;
                }
              }
            }
          }
          
          // Default version if nothing found
          if (!versionFound) {
            metadata.versionName = "1.0.0";
            console.log('Using default version 1.0.0');
          }
          
          // Extract version code - critical field, try multiple approaches
          let versionCodeFound = false;
          
          // First approach: Use regular patterns
          const versionCode = findFirstMatchAsNumber(versionCodePatterns, cleanedBuffer);
          if (versionCode) {
            console.log('Extracted version code:', versionCode);
            metadata.versionCode = versionCode;
            versionCodeFound = true;
          } 
          
          // Second approach: Look for "versionCode" keyword
          if (!versionCodeFound) {
            const versionCodeIndexes = [
              cleanedBuffer.indexOf('versionCode='),
              cleanedBuffer.indexOf('VersionCode='),
              cleanedBuffer.indexOf('VERSION_CODE='),
              cleanedBuffer.indexOf('android:versionCode')
            ];
            
            for (const idx of versionCodeIndexes) {
              if (idx > 0) {
                const nearbyText = cleanedBuffer.substring(idx, idx + 100);
                console.log(`Found versionCode marker at ${idx}, context:`, nearbyText.substring(0, 50));
                
                // Look for quoted or unquoted number
                const numberMatch = nearbyText.match(/=\s*"?(\d+)"?/);
                if (numberMatch && numberMatch[1]) {
                  metadata.versionCode = parseInt(numberMatch[1], 10);
                  console.log('Found version code with regex:', metadata.versionCode);
                  versionCodeFound = true;
                  break;
                }
                
                // Fallback to any number
                const simpleMatch = nearbyText.match(/\d+/);
                if (simpleMatch) {
                  metadata.versionCode = parseInt(simpleMatch[0], 10);
                  console.log('Found simple version code:', metadata.versionCode);
                  versionCodeFound = true;
                  break;
                }
              }
            }
          }
          
          // Third approach: Try to derive version code from version name
          if (!versionCodeFound && metadata.versionName) {
            try {
              // Common pattern: version 1.2.3 -> versionCode 10203
              const parts = metadata.versionName.split('.');
              if (parts.length >= 2) {
                let code = 0;
                if (parts.length >= 3) {
                  // 1.2.3 -> 10203
                  code = parseInt(parts[0]) * 10000 + parseInt(parts[1]) * 100 + parseInt(parts[2]);
                } else {
                  // 1.2 -> 10200
                  code = parseInt(parts[0]) * 10000 + parseInt(parts[1]) * 100;
                }
                
                if (!isNaN(code) && code > 0) {
                  metadata.versionCode = code;
                  console.log('Derived version code from version name:', metadata.versionCode);
                  versionCodeFound = true;
                }
              }
            } catch (e) {
              console.warn('Error deriving version code from version name:', e);
            }
          }
          
          // Default version code if nothing found
          if (!versionCodeFound) {
            metadata.versionCode = 1;
            console.log('Using default version code: 1');
          }
          
          // Extract minSdkVersion
          const minSdkVersion = findFirstMatchAsNumber(minSdkPatterns, cleanedBuffer);
          if (minSdkVersion) {
            console.log('Extracted min SDK version:', minSdkVersion);
            metadata.minSdkVersion = minSdkVersion;
          } else {
            // Try another approach by looking for "minSdkVersion" keyword
            const minSdkIndex = cleanedBuffer.indexOf('minSdkVersion');
            if (minSdkIndex > 0) {
              const nearbyText = cleanedBuffer.substring(minSdkIndex, minSdkIndex + 100);
              const minSdkMatch = nearbyText.match(/\d+/);
              if (minSdkMatch) {
                metadata.minSdkVersion = parseInt(minSdkMatch[0], 10);
                console.log('Found min SDK version from keyword:', metadata.minSdkVersion);
              }
            }
          }
          
          // The text has binary characters, but we can still use it for our pattern matching
          manifestText = bufferString;
        } else {
          // Regular text XML
          const text = await manifestBlob.text();
          manifestText = text;
          console.log('Manifest extracted as text, length:', text.length);
        }
      }
    } catch (blobError) {
      console.error('Error with BlobWriter for manifest:', blobError);
      
      try {
        // Fallback to TextWriter
        console.log('Falling back to TextWriter');
        const writer = new TextWriter();
        const data = await manifestEntry.getData?.(writer);
        manifestText = data as string;
        console.log('Manifest data extracted with TextWriter, length:', manifestText?.length);
      } catch (textWriterError) {
        console.error('Error in getData with TextWriter:', textWriterError);
        throw new Error(`Failed to extract AndroidManifest.xml data: ${blobError}, and fallback failed: ${textWriterError}`);
      }
    }
    
    if (!manifestText) {
      throw new Error('Failed to extract AndroidManifest.xml data - no content returned');
    }
    
    // Look for package name (this is a rough approximation)
    const packageMatch = manifestText.match(/package="([^"]+)"/);
    if (packageMatch && packageMatch[1]) {
      metadata.packageName = packageMatch[1];
      
      // If we found a package name, we can try to use it as fallback app name
      // by converting com.example.myapp to My App
      if (!metadata.appName) {
        const packageParts = metadata.packageName.split('.');
        if (packageParts.length > 0) {
          // Try to extract a name from the last part of the package
          const lastPart = packageParts[packageParts.length - 1];
          // Convert camelCase or snake_case to words and capitalize
          const appName = lastPart
            // Insert space before capitals
            .replace(/([A-Z])/g, ' $1')
            // Replace underscores with spaces
            .replace(/_/g, ' ')
            // Trim, ensure first letter is capitalized
            .trim();
          
          if (appName) {
            metadata.appName = appName.charAt(0).toUpperCase() + appName.slice(1);
          }
        }
      }
    }
    
    // Look for an application label in manifest
    const appLabelMatch = manifestText.match(/android:label="([^"]+)"/);
    if (appLabelMatch && appLabelMatch[1]) {
      metadata.appName = appLabelMatch[1];
    }
    
    // Try to find version info
    const versionNameMatch = manifestText.match(/versionName="([^"]+)"/);
    if (versionNameMatch && versionNameMatch[1]) {
      metadata.versionName = versionNameMatch[1];
    }
    
    const versionCodeMatch = manifestText.match(/versionCode="([^"]+)"/);
    if (versionCodeMatch && versionCodeMatch[1]) {
      metadata.versionCode = parseInt(versionCodeMatch[1], 10);
    }
    
    const minSdkMatch = manifestText.match(/minSdkVersion="([^"]+)"/);
    if (minSdkMatch && minSdkMatch[1]) {
      metadata.minSdkVersion = parseInt(minSdkMatch[1], 10);
    }
    
    // If we still don't have an app name, try extracting it from the filename
    // Note: In extractApkMetadata we don't have the file reference, so we'll rely on the extracted info
    if (!metadata.appName && metadata.packageName) {
      console.log('No app name found, using package name as a fallback');
      
      // Use package name, e.g., com.example.myapp -> My App
      const packageParts = metadata.packageName.split('.');
      if (packageParts.length > 0) {
        // Get the last part of the package name
        const lastPart = packageParts[packageParts.length - 1];
        
        // Convert camelCase or snake_case to words and capitalize
        const appName = lastPart
          // Insert space before capitals
          .replace(/([A-Z])/g, ' $1')
          // Replace underscores with spaces
          .replace(/_/g, ' ')
          // Trim and ensure first letter is capitalized
          .trim();
          
        if (appName && appName.length >= 2) {
          const finalName = appName.charAt(0).toUpperCase() + appName.slice(1);
          console.log('Derived app name from package name:', finalName);
          metadata.appName = finalName;
        } else {
          // If we can't get a name from the last part, try using the full package name
          const simpleName = metadata.packageName.split('.').pop() || metadata.packageName;
          console.log('Using simplified package name as app name:', simpleName);
          metadata.appName = simpleName;
        }
      }
    }
    
    // If we couldn't find an app name in the manifest, try looking for it in strings.xml
    if (!metadata.appName) {
      try {
        // Look for strings.xml in various resource folders (some APKs have different localized folders)
        const stringsEntries = entries.filter(entry => 
          entry.filename.includes('res/values') && 
          entry.filename.endsWith('strings.xml')
        );
        
        console.log('Found strings entries:', stringsEntries.map(e => e.filename));
        
        if (stringsEntries.length > 0) {
          // Prioritize default strings.xml (no locale suffix)
          const stringsEntry = stringsEntries.find(entry => 
            entry.filename === 'res/values/strings.xml'
          ) || stringsEntries[0];
          
          console.log('Using strings.xml from:', stringsEntry.filename);
          
          // Use TextWriter for strings.xml too
          try {
            const writer = new TextWriter();
            const stringsXml = await stringsEntry.getData?.(writer) as string;
            
            console.log('Strings.xml data extracted, length:', stringsXml?.length);
            
            // Look for app_name in strings.xml
            const appNameMatch = stringsXml.match(/<string name="app_name">([^<]+)<\/string>/);
            if (appNameMatch && appNameMatch[1]) {
              metadata.appName = appNameMatch[1];
              console.log('Found app name in strings.xml:', metadata.appName);
            }
          } catch (textWriterError) {
            console.error('Error with TextWriter for strings.xml, trying BlobWriter:', textWriterError);
            
            // Fallback to BlobWriter
            try {
              const blobWriter = new BlobWriter();
              const blob = await stringsEntry.getData?.(blobWriter);
              if (blob) {
                const stringsXml = await (blob as Blob).text();
                // Look for app_name in strings.xml
                const appNameMatch = stringsXml.match(/<string name="app_name">([^<]+)<\/string>/);
                if (appNameMatch && appNameMatch[1]) {
                  metadata.appName = appNameMatch[1];
                  console.log('Found app name in strings.xml using BlobWriter:', metadata.appName);
                }
              }
            } catch (blobError) {
              console.error('Error with BlobWriter for strings.xml:', blobError);
            }
          }
        }
      } catch (error) {
        console.log('Error extracting strings.xml:', error);
      }
    }
    
    await reader.close();
  } catch (error) {
    console.error('Error extracting APK metadata:', error);
  }
  
  return metadata;
}

/**
 * Converts Android SDK version to Android OS version
 * @param sdkVersion Android SDK version
 * @returns Android OS version as string (e.g., "5.0")
 */
export function sdkToAndroidVersion(sdkVersion?: number): string | undefined {
  if (!sdkVersion) return undefined;
  
  const sdkVersionMap: Record<number, string> = {
    21: "5.0", // Lollipop
    22: "5.1", // Lollipop
    23: "6.0", // Marshmallow
    24: "7.0", // Nougat
    25: "7.1", // Nougat
    26: "8.0", // Oreo
    27: "8.1", // Oreo
    28: "9.0", // Pie
    29: "10.0", // Q
    30: "11.0", // R
    31: "12.0", // S
    32: "12.1", // S
    33: "13.0", // T
    34: "14.0", // U
  };
  
  return sdkVersionMap[sdkVersion] || `Unknown (SDK ${sdkVersion})`;
}