import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../db/supabase.js';

const router = express.Router();

/**
 * Register a new user
 */
router.post('/register', async (req, res, next) => {
  try {
    const { username, password, firstName, lastName, medicalCouncilNumber } = req.body;
    
    if (!username || !password || !firstName || !lastName || !medicalCouncilNumber) {
      return res.status(400).json({ error: 'تمامی فیلدها (نام، نام خانوادگی، نام کاربری، شماره نظام پزشکی و رمز عبور) الزامی هستند.' });
    }

    const { data: checkUser } = await supabase
      .from('users')
      .select('id')
      .or(`username.eq.${username},medical_council_number.eq.${medicalCouncilNumber}`)
      .maybeSingle();

    if (checkUser) {
      return res.status(409).json({ error: 'این نام کاربری یا شماره نظام پزشکی قبلاً ثبت شده است.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const id = uuidv4();

    const { error: insertError } = await supabase.from('users').insert({
      id,
      username,
      password_hash: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      medical_council_number: medicalCouncilNumber
    });

    if (insertError) {
      console.error('Supabase Error:', insertError);
      return res.status(500).json({ error: 'خطا در ارتباط با دیتابیس' });
    }

    res.status(201).json({ message: 'ثبت‌نام با موفقیت انجام شد.' });
  } catch (error) {
    next(error);
  }
});

/**
 * Login a user
 */
router.post('/login', async (req, res, next) => {
  try {
    const { medicalCouncilNumber, password } = req.body;

    if (!medicalCouncilNumber || !password) {
      return res.status(400).json({ error: 'شماره نظام پزشکی و رمز عبور الزامی است.' });
    }

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('medical_council_number', medicalCouncilNumber)
      .maybeSingle();
    
    if (fetchError || !user) {
      return res.status(401).json({ error: 'شماره نظام پزشکی یا رمز عبور اشتباه است.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'شماره نظام پزشکی یا رمز عبور اشتباه است.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, firstName: user.first_name, lastName: user.last_name, medicalCouncilNumber: user.medical_council_number },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '1d' }
    );

    res.json({ token, user: { id: user.id, username: user.username, role: user.role, firstName: user.first_name, lastName: user.last_name, medicalCouncilNumber: user.medical_council_number } });
  } catch (error) {
    next(error);
  }
});

export default router;
