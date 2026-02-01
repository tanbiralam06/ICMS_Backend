/**
 * Geofence Test Script
 *
 * This script tests the 50m geofencing logic for the punch-in system.
 * Office Location: Lat: 26.4193, Lng: 89.2608
 *
 * Run with: node src/tests/geofence.test.js
 */

import { calculateDistance } from "../utils/geoUtils.js";

// ============================================
// CONFIGURATION
// ============================================
const OFFICE_LAT = 26.4193;
const OFFICE_LNG = 89.2608;
const ALLOWED_RADIUS = 50; // meters

// ============================================
// TEST CASES
// ============================================
const testCases = [
  // Scenario 1: Perfect Match
  {
    name: "Perfect Match (Exact coordinates)",
    lat: 26.4193,
    lng: 89.2608,
    expectedSuccess: true,
    description: "User is at the exact office location",
  },

  // Scenario 2: Within Range (~20m away)
  {
    name: "Within Range - East (~20m)",
    lat: 26.4193,
    lng: 89.261,
    expectedSuccess: true,
    description: "User is ~20m east of office",
  },
  {
    name: "Within Range - North (~20m)",
    lat: 26.4195,
    lng: 89.2608,
    expectedSuccess: true,
    description: "User is ~20m north of office",
  },
  {
    name: "Within Range - South (~20m)",
    lat: 26.4191,
    lng: 89.2608,
    expectedSuccess: true,
    description: "User is ~20m south of office",
  },
  {
    name: "Within Range - West (~20m)",
    lat: 26.4193,
    lng: 89.2606,
    expectedSuccess: true,
    description: "User is ~20m west of office",
  },
  {
    name: "Within Range - Diagonal (~30m)",
    lat: 26.4195,
    lng: 89.261,
    expectedSuccess: true,
    description: "User is ~30m northeast of office",
  },

  // Scenario 3: Edge Cases (Around 50m threshold)
  {
    name: "Edge Case - Just Under 50m (~45m North)",
    lat: 26.4197,
    lng: 89.2608,
    expectedSuccess: true,
    description: "User is ~45m north, just inside boundary",
  },
  {
    name: "Edge Case - At ~49m (Should Pass)",
    lat: 26.41974,
    lng: 89.2608,
    expectedSuccess: true,
    description: "User is ~49m north, just inside the 50m boundary",
  },
  {
    name: "Edge Case - At ~51m (Should Fail)",
    lat: 26.41976,
    lng: 89.2608,
    expectedSuccess: false,
    description: "User is ~51m north, just outside the 50m boundary",
  },

  // Scenario 4: Just Outside (~60m away)
  {
    name: "Just Outside - North (~55m)",
    lat: 26.4198,
    lng: 89.2608,
    expectedSuccess: false,
    description: "User is ~55m north of office",
  },
  {
    name: "Just Outside - South (~60m)",
    lat: 26.4187,
    lng: 89.2608,
    expectedSuccess: false,
    description: "User is ~60m south of office",
  },
  {
    name: "Just Outside - East (~60m)",
    lat: 26.4193,
    lng: 89.2614,
    expectedSuccess: false,
    description: "User is ~60m east of office",
  },
  {
    name: "Just Outside - West (~60m)",
    lat: 26.4193,
    lng: 89.2602,
    expectedSuccess: false,
    description: "User is ~60m west of office",
  },

  // Scenario 5: Very Far (1km away)
  {
    name: "Very Far - 1km North",
    lat: 26.4283,
    lng: 89.2608,
    expectedSuccess: false,
    description: "User is ~1km north of office",
  },
  {
    name: "Very Far - 1km South",
    lat: 26.4103,
    lng: 89.2608,
    expectedSuccess: false,
    description: "User is ~1km south of office",
  },
  {
    name: "Very Far - 1km East",
    lat: 26.4193,
    lng: 89.2708,
    expectedSuccess: false,
    description: "User is ~1km east of office",
  },
  {
    name: "Very Far - 1km West",
    lat: 26.4193,
    lng: 89.2508,
    expectedSuccess: false,
    description: "User is ~1km west of office",
  },

  // Additional directional tests for comprehensive coverage
  {
    name: "NE Diagonal - ~70m",
    lat: 26.4198,
    lng: 89.2613,
    expectedSuccess: false,
    description: "User is ~70m northeast of office",
  },
  {
    name: "SE Diagonal - ~70m",
    lat: 26.4188,
    lng: 89.2613,
    expectedSuccess: false,
    description: "User is ~70m southeast of office",
  },
  {
    name: "SW Diagonal - ~70m",
    lat: 26.4188,
    lng: 89.2603,
    expectedSuccess: false,
    description: "User is ~70m southwest of office",
  },
  {
    name: "NW Diagonal - ~70m",
    lat: 26.4198,
    lng: 89.2603,
    expectedSuccess: false,
    description: "User is ~70m northwest of office",
  },
];

// ============================================
// TEST RUNNER
// ============================================
function runTests() {
  console.log(
    "╔════════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║         GEOFENCE TEST SUITE - 50m Radius Validation            ║",
  );
  console.log(
    "╠════════════════════════════════════════════════════════════════╣",
  );
  console.log(
    `║ Office Location: Lat ${OFFICE_LAT}, Lng ${OFFICE_LNG}              ║`,
  );
  console.log(
    `║ Allowed Radius: ${ALLOWED_RADIUS} meters                                   ║`,
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝\n",
  );

  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase, index) => {
    const distance = calculateDistance(
      testCase.lat,
      testCase.lng,
      OFFICE_LAT,
      OFFICE_LNG,
    );

    const isWithinRadius = distance <= ALLOWED_RADIUS;
    const testPassed = isWithinRadius === testCase.expectedSuccess;

    // Determine status icon and message
    const statusIcon = testPassed ? "✅" : "❌";
    const status = testPassed ? "PASS" : "FAIL";

    // Build the result message (mimicking what the controller would return)
    let resultMessage;
    if (isWithinRadius) {
      resultMessage = "Punch-in allowed";
    } else {
      resultMessage = `You are not at the office. You are ${Math.round(distance)}m away. Allowed radius: ${ALLOWED_RADIUS}m.`;
    }

    console.log(`${statusIcon} Test ${index + 1}: ${testCase.name}`);
    console.log(`   Description: ${testCase.description}`);
    console.log(`   User Location: (${testCase.lat}, ${testCase.lng})`);
    console.log(`   Distance: ${distance.toFixed(2)} meters`);
    console.log(
      `   Expected: ${testCase.expectedSuccess ? "Success" : "Error"}`,
    );
    console.log(`   Actual: ${isWithinRadius ? "Success" : "Error"}`);
    console.log(`   Result Message: ${resultMessage}`);
    console.log(`   Status: ${status}`);
    console.log("");

    if (testPassed) {
      passed++;
    } else {
      failed++;
    }
  });

  // Summary
  console.log(
    "═══════════════════════════════════════════════════════════════════",
  );
  console.log(
    "                            SUMMARY                                 ",
  );
  console.log(
    "═══════════════════════════════════════════════════════════════════",
  );
  console.log(`Total Tests: ${testCases.length}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ${failed > 0 ? "❌" : ""}`);
  console.log(
    `Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`,
  );
  console.log(
    "═══════════════════════════════════════════════════════════════════\n",
  );

  // Exit with appropriate code for CI/CD integration
  if (failed > 0) {
    process.exit(1);
  }
}

// ============================================
// UTILITY: Generate test point at specific distance
// ============================================
function generatePointAtDistance(
  baseLat,
  baseLng,
  distanceMeters,
  bearingDegrees,
) {
  const R = 6371e3; // Earth's radius in meters
  const bearing = (bearingDegrees * Math.PI) / 180;
  const lat1 = (baseLat * Math.PI) / 180;
  const lng1 = (baseLng * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distanceMeters / R) +
      Math.cos(lat1) * Math.sin(distanceMeters / R) * Math.cos(bearing),
  );

  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(distanceMeters / R) * Math.cos(lat1),
      Math.cos(distanceMeters / R) - Math.sin(lat1) * Math.sin(lat2),
    );

  return {
    lat: (lat2 * 180) / Math.PI,
    lng: (lng2 * 180) / Math.PI,
  };
}

// Print reference points at exact distances for debugging
function printReferencePoints() {
  console.log(
    "\n╔════════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║              REFERENCE POINTS AT EXACT DISTANCES               ║",
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝\n",
  );

  const distances = [20, 50, 60, 100, 500, 1000];
  const directions = [
    { name: "North", bearing: 0 },
    { name: "East", bearing: 90 },
    { name: "South", bearing: 180 },
    { name: "West", bearing: 270 },
  ];

  distances.forEach((dist) => {
    console.log(`--- ${dist}m from office ---`);
    directions.forEach((dir) => {
      const point = generatePointAtDistance(
        OFFICE_LAT,
        OFFICE_LNG,
        dist,
        dir.bearing,
      );
      const verifyDist = calculateDistance(
        point.lat,
        point.lng,
        OFFICE_LAT,
        OFFICE_LNG,
      );
      console.log(
        `  ${dir.name}: (${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}) - Verified: ${verifyDist.toFixed(2)}m`,
      );
    });
    console.log("");
  });
}

// ============================================
// RUN
// ============================================
runTests();
printReferencePoints();
