#!/usr/bin/env node

const nodemailer = require('nodemailer');
require('dotenv').config();

async function testZohoMail() {
  console.log('🔍 Testing Zoho Mail Configuration...\n');

  // Check environment variables
  const config = {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS ? '***' : 'NOT SET',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  };

  console.log('📋 Configuration loaded:');
  Object.entries(config).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });

  // Validate required fields
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('\n❌ Missing configuration:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    console.log('\n🔗 Testing connection...');
    await transporter.verify();
    console.log('✅ Zoho Mail connection successful!\n');

    console.log('📧 Ready to send emails:');
    console.log(`   From: ${process.env.SMTP_USER}`);
    console.log(`   SMTP: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
    console.log('\n✨ All email flows can now use Zoho Mail');

  } catch (error) {
    console.error('\n❌ Connection failed:');
    console.error(`   ${error.message}`);
    console.error('\nTroubleshooting:');
    console.error('   1. Verify SMTP_HOST: smtp.zoho.com (not smtp.gmail.com)');
    console.error('   2. Verify SMTP_PORT: 587 (TLS, not 465)');
    console.error('   3. Verify SMTP_USER: info@gazaarabia.com');
    console.error('   4. Verify SMTP_PASS: correct app password (not account password)');
    console.error('   5. Check Zoho Mail settings: Security > App passwords');
    process.exit(1);
  }
}

testZohoMail();