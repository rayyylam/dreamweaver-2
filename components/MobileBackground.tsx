import React, { useEffect, useRef } from 'react';

/**
 * 移动端动态背景组件
 * 包含星空水面背景图 + 萤火虫光点动画
 */
const MobileBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        interface Firefly {
            x: number;
            y: number;
            size: number;
            opacity: number;
            targetOpacity: number;
            vx: number;
            vy: number;
            pulse: number;
            pulseSpeed: number;
            color: string;
        }

        let fireflies: Firefly[] = [];

        const colors = [
            '94, 234, 212',   // 青绿色
            '153, 246, 228',  // 浅青色
            '249, 168, 212',  // 粉色
            '251, 207, 232',  // 浅粉色
            '255, 255, 220',  // 暖白色
        ];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createFirefly = (): Firefly => {
            return {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: 2 + Math.random() * 3,
                opacity: Math.random() * 0.5,
                targetOpacity: 0.3 + Math.random() * 0.7,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: 0.02 + Math.random() * 0.03,
                color: colors[Math.floor(Math.random() * colors.length)],
            };
        };

        // 初始化萤火虫
        const initFireflies = () => {
            const count = Math.min(25, Math.floor(canvas.width * canvas.height / 15000));
            fireflies = [];
            for (let i = 0; i < count; i++) {
                fireflies.push(createFirefly());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            fireflies.forEach((fly) => {
                // 更新位置
                fly.x += fly.vx;
                fly.y += fly.vy;

                // 边界检测，柔和反弹
                if (fly.x < 0 || fly.x > canvas.width) fly.vx *= -1;
                if (fly.y < 0 || fly.y > canvas.height) fly.vy *= -1;

                // 随机改变方向
                if (Math.random() < 0.01) {
                    fly.vx += (Math.random() - 0.5) * 0.1;
                    fly.vy += (Math.random() - 0.5) * 0.1;
                    // 限制速度
                    fly.vx = Math.max(-0.5, Math.min(0.5, fly.vx));
                    fly.vy = Math.max(-0.5, Math.min(0.5, fly.vy));
                }

                // 呼吸闪烁效果
                fly.pulse += fly.pulseSpeed;
                const pulseOpacity = (Math.sin(fly.pulse) + 1) / 2;
                const currentOpacity = fly.opacity * 0.3 + pulseOpacity * 0.7;

                // 绘制萤火虫光晕
                const gradient = ctx.createRadialGradient(
                    fly.x, fly.y, 0,
                    fly.x, fly.y, fly.size * 4
                );
                gradient.addColorStop(0, `rgba(${fly.color}, ${currentOpacity})`);
                gradient.addColorStop(0.3, `rgba(${fly.color}, ${currentOpacity * 0.5})`);
                gradient.addColorStop(1, `rgba(${fly.color}, 0)`);

                ctx.beginPath();
                ctx.arc(fly.x, fly.y, fly.size * 4, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // 绘制萤火虫核心亮点
                ctx.beginPath();
                ctx.arc(fly.x, fly.y, fly.size * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.8})`;
                ctx.fill();
            });

            animationId = requestAnimationFrame(animate);
        };

        resize();
        initFireflies();
        window.addEventListener('resize', () => {
            resize();
            initFireflies();
        });
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <div className="mobile-bg-container">
            {/* 背景图层 */}
            <div className="mobile-bg-image" />

            {/* Canvas 萤火虫层 */}
            <canvas
                ref={canvasRef}
                className="mobile-bg-ripples"
            />

            {/* 渐变遮罩确保文字可读 */}
            <div className="mobile-bg-overlay" />
        </div>
    );
};

export default MobileBackground;
