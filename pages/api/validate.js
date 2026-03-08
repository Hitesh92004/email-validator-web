import { Parser } from 'json2csv';

const { validateEmail } = require('../../lib/validator');
const { parseCsvEmails } = require('../../utils/csvProcessor');

const MAX_EMAILS = 10000;

function normalizeEmailInput(rawEmails) {
  if (Array.isArray(rawEmails)) {
    return rawEmails;
  }

  if (typeof rawEmails === 'string') {
    return rawEmails
      .split(/[\n,;\t ]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { emails, csvContent } = req.body || {};

    const textEmails = normalizeEmailInput(emails);
    const csvEmails = csvContent ? await parseCsvEmails(csvContent) : [];

    const allEmails = [...textEmails, ...csvEmails]
      .map((email) => email.trim())
      .filter(Boolean);

    if (allEmails.length === 0) {
      return res.status(400).json({ error: 'No emails provided' });
    }

    if (allEmails.length > MAX_EMAILS) {
      return res.status(400).json({
        error: `Email limit exceeded. Maximum allowed is ${MAX_EMAILS}.`
      });
    }

    const results = await Promise.all(
      allEmails.map(async (email) => ({
        email,
        status: await validateEmail(email)
      }))
    );

    const csvParser = new Parser({ fields: ['email', 'status'] });
    const csvResult = csvParser.parse(results);

    return res.status(200).json({ results, csv: csvResult });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to validate emails',
      details: error.message
    });
  }
}
