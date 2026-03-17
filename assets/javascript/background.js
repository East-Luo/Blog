document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('background');
    const ctx = canvas.getContext('2d');

    // 设置canvas大小为窗口大小
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // 正四面体顶点坐标
    const vertices = [
        { x: 1, y: 1, z: 1 },    // 顶点0
        { x: -1, y: -1, z: 1 },  // 顶点1
        { x: -1, y: 1, z: -1 },  // 顶点2
        { x: 1, y: -1, z: -1 }   // 顶点3
    ];

    // 棱边连接关系
    const edges = [
        [0, 1], [0, 2], [0, 3], // 从顶点0出发的三条边
        [1, 2], [1, 3],         // 底面边
        [2, 3]                  // 底面边
    ];

    // 投影参数
    const scale = 100;
    const distance = 5;

    // 旋转参数
    let axisAngleX = 0;  // 旋转轴X角度
    let axisAngleY = 0;  // 旋转轴Y角度
    let axisAngleZ = 0;  // 旋转轴Z角度
    let rotationSpeed = 0.002;  // 四面体自转速度(降低到原来的一半)
    let selfRotation = 0;  // 四面体自转角度

    // 平滑随机目标角度
    let targetAxisAngleX = Math.random() * Math.PI * 2;
    let targetAxisAngleY = Math.random() * Math.PI * 2;
    let targetAxisAngleZ = Math.random() * Math.PI * 2;
    let noiseOffsetX = Math.random() * 70;
    let noiseOffsetY = Math.random() * 70;
    let noiseOffsetZ = Math.random() * 70;

    // 简单噪声函数
    function noise(x) {
        return Math.sin(x) * 0.2 + 0.2;
    }

    // 旋转动画
    function animate() {
        requestAnimationFrame(animate);

        // 四面体持续自转
        selfRotation += rotationSpeed;

        // 使用噪声函数平滑改变旋转轴
        noiseOffsetX += 0.0015;  // 降低到原来的一半
        noiseOffsetY += 0.0015;  // 降低到原来的一半
        noiseOffsetZ += 0.0015;  // 降低到原来的一半

        // 计算新的目标角度
        targetAxisAngleX = noise(noiseOffsetX) * Math.PI * 2;
        targetAxisAngleY = noise(noiseOffsetY) * Math.PI * 2;
        targetAxisAngleZ = noise(noiseOffsetZ) * Math.PI * 2;

        // 平滑过渡到目标角度
        axisAngleX += (targetAxisAngleX - axisAngleX) * 0.01;
        axisAngleY += (targetAxisAngleY - axisAngleY) * 0.01;
        axisAngleZ += (targetAxisAngleZ - axisAngleZ) * 0.01;

        draw();
    }

    // 绘制函数
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 预计算旋转矩阵
        const cosA = Math.cos(selfRotation);
        const sinA = Math.sin(selfRotation);
        const cosX = Math.cos(axisAngleX);
        const sinX = Math.sin(axisAngleX);
        const cosY = Math.cos(axisAngleY);
        const sinY = Math.sin(axisAngleY);
        const cosZ = Math.cos(axisAngleZ);
        const sinZ = Math.sin(axisAngleZ);

        // 计算旋转后的顶点
        const rotatedVertices = vertices.map(v => {
            // 应用自转
            const x = v.x;
            const y = v.y * cosA - v.z * sinA;
            const z = v.y * sinA + v.z * cosA;

            // 应用旋转轴变换
            // 绕X轴旋转
            const x2 = x;
            const y2 = y * cosX - z * sinX;
            const z2 = y * sinX + z * cosX;

            // 绕Y轴旋转
            const x3 = x2 * cosY - z2 * sinY;
            const z3 = x2 * sinY + z2 * cosY;

            // 绕Z轴旋转
            return {
                x: x3 * cosZ - y2 * sinZ,
                y: x3 * sinZ + y2 * cosZ,
                z: z3
            };
        });

        // 投影到2D
        const projectedVertices = rotatedVertices.map(v => {
            const factor = distance / (distance - v.z);
            return {
                x: v.x * factor * scale + canvas.width / 2,
                y: v.y * factor * scale + canvas.height / 2
            };
        });

        // 绘制棱边
        edges.forEach(edge => {
            const [i, j] = edge;
            const v1 = projectedVertices[i];
            const v2 = projectedVertices[j];

            // 预计算光晕参数
            const glowParams = [
                { width: 3, alpha: 0.3, blur: 12 },
                { width: 5, alpha: 0.2, blur: 18 },
                { width: 8, alpha: 0.1, blur: 25 }
            ];

            // 绘制光晕效果
            glowParams.forEach(param => {
                // ctx.strokeStyle = `rgba(255, 255, 255, ${param.alpha})`;
                ctx.lineWidth = param.width;
                ctx.shadowBlur = param.blur;
                // ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';

                ctx.beginPath();
                ctx.moveTo(v1.x, v1.y);
                ctx.lineTo(v2.x, v2.y);
                ctx.stroke();
            });

            // 绘制主棱边
            ctx.strokeStyle = ' rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.moveTo(v1.x, v1.y);
            ctx.lineTo(v2.x, v2.y);
            ctx.stroke();
        });
    }

    // 启动动画
    animate();
});