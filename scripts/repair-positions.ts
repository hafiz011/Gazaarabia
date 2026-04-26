/**
 * Position Repair & Verification Script
 * Run this script to verify positions are sequential and fix any gaps/duplicates
 * 
 * Usage: npx ts-node scripts/repair-positions.ts [--fix]
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface PositionIssue {
  menuId: number;
  menuName?: string;
  issue: string;
  details: any;
}

async function verifyPositions() {
  console.log("🔍 Verifying submenu positions...\n");

  const menus = await prisma.menus.findMany();
  const issues: PositionIssue[] = [];

  for (const menu of menus) {
    const submenus = await prisma.submenus.findMany({
      where: { menuId: menu.id },
      orderBy: { position: "asc" },
    });

    if (submenus.length === 0) continue;

    // Check for gaps
    const positions = submenus.map((s) => s.position);
    for (let i = 0; i < positions.length; i++) {
      if (positions[i] !== i) {
        issues.push({
          menuId: menu.id,
          menuName: menu.name,
          issue: "POSITION_GAP",
          details: {
            expected: i,
            actual: positions[i],
            itemId: submenus[i].id,
          },
        });
      }
    }

    // Check for duplicates
    const positionSet = new Set(positions);
    if (positionSet.size !== positions.length) {
      issues.push({
        menuId: menu.id,
        menuName: menu.name,
        issue: "DUPLICATE_POSITIONS",
        details: { positions, count: submenus.length },
      });
    }

    // Check for negative positions
    if (positions.some((p) => p < 0)) {
      issues.push({
        menuId: menu.id,
        menuName: menu.name,
        issue: "NEGATIVE_POSITION",
        details: { positions: positions.filter((p) => p < 0) },
      });
    }
  }

  if (issues.length === 0) {
    console.log("✅ All positions are valid and sequential!\n");
    return true;
  }

  console.log(`❌ Found ${issues.length} issue(s):\n`);
  issues.forEach((issue) => {
    console.log(`  Menu: ${issue.menuName} (ID: ${issue.menuId})`);
    console.log(`  Issue: ${issue.issue}`);
    console.log(`  Details:`, issue.details);
    console.log("");
  });

  return false;
}

async function repairPositions() {
  console.log("🔧 Repairing submenu positions...\n");

  const menus = await prisma.menus.findMany();
  let repaired = 0;

  for (const menu of menus) {
    const submenus = await prisma.submenus.findMany({
      where: { menuId: menu.id },
      orderBy: { position: "asc" },
    });

    if (submenus.length === 0) continue;

    // Recalculate positions
    for (let i = 0; i < submenus.length; i++) {
      if (submenus[i].position !== i) {
        await prisma.submenus.update({
          where: { id: submenus[i].id },
          data: { position: i },
        });
        repaired++;
        console.log(
          `  ✓ Menu "${menu.name}": Item ${submenus[i].id} → position ${i}`
        );
      }
    }
  }

  console.log(
    `\n✅ Repair complete! Fixed ${repaired} position(s)\n`
  );
}

async function generateReport() {
  console.log("📊 Position System Report\n");

  const menuStats = await prisma.menus.findMany({
    include: {
      submenus: {
        select: { id: true, position: true },
      },
    },
  });

  console.log("Menu Statistics:");
  console.log("================");
  let totalSubmenus = 0;

  menuStats.forEach((menu) => {
    const count = menu.submenus.length;
    totalSubmenus += count;
    const positions = menu.submenus.map((s) => s.position).sort((a, b) => a - b);
    const isValid = positions.every((p, i) => p === i);

    console.log(
      `  ${menu.name.padEnd(30)} | Items: ${String(count).padStart(3)} | Status: ${
        isValid ? "✅ Valid" : "❌ Invalid"
      }`
    );
  });

  console.log("");
  console.log(`Total Submenus: ${totalSubmenus}`);
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const shouldFix = args.includes("--fix");

    console.log("═".repeat(50));
    console.log("  Submenu Position Repair Tool");
    console.log("═".repeat(50));
    console.log("");

    // Verify first
    const isValid = await verifyPositions();

    if (!isValid && shouldFix) {
      await repairPositions();
    } else if (!isValid) {
      console.log(
        "💡 Run with --fix flag to automatically repair: npm run repair-positions -- --fix\n"
      );
    }

    // Generate report
    await generateReport();

    console.log("═".repeat(50));
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
