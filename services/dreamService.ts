import { supabase } from './supabaseClient';
import { DreamEntry } from '../types';

/**
 * 梦境数据服务 - Supabase CRUD 操作
 */
export const dreamService = {
    /**
     * 获取所有梦境记录（按时间倒序）
     */
    async getAll(): Promise<DreamEntry[]> {
        const { data, error } = await supabase
            .from('dreams')
            .select('*')
            .order('timestamp', { ascending: false });

        if (error) {
            console.error('获取梦境失败:', error);
            throw error;
        }

        return (data || []).map(this.transformFromDB);
    },

    /**
     * 创建新梦境记录
     */
    async create(dream: DreamEntry): Promise<DreamEntry> {
        // 获取当前用户 ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('未登录，无法创建梦境');
        }

        const dbRecord = {
            ...this.transformToDB(dream),
            user_id: user.id,  // 关联当前用户
        };

        const { data, error } = await supabase
            .from('dreams')
            .insert(dbRecord)
            .select()
            .single();

        if (error) {
            console.error('创建梦境失败:', error);
            throw error;
        }

        return this.transformFromDB(data);
    },

    /**
     * 更新梦境记录
     */
    async update(id: string, dream: Partial<DreamEntry>): Promise<DreamEntry> {
        const dbRecord = this.transformToDB(dream as DreamEntry);

        const { data, error } = await supabase
            .from('dreams')
            .update(dbRecord)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('更新梦境失败:', error);
            throw error;
        }

        return this.transformFromDB(data);
    },

    /**
     * 删除梦境记录
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('dreams')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('删除梦境失败:', error);
            throw error;
        }
    },

    /**
     * 将前端数据格式转换为数据库格式
     */
    transformToDB(dream: DreamEntry) {
        return {
            id: dream.id,
            timestamp: dream.timestamp,
            keywords: dream.keywords,
            decoding: dream.decoding,
            association: dream.association,
            ai_reflection: dream.aiReflection || null,
        };
    },

    /**
     * 将数据库格式转换为前端数据格式
     */
    transformFromDB(record: any): DreamEntry {
        return {
            id: record.id,
            timestamp: record.timestamp,
            keywords: record.keywords,
            decoding: record.decoding,
            association: record.association,
            aiReflection: record.ai_reflection,
        };
    },
};
