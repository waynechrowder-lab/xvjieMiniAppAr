class Vec2 {
    constructor(x, y) {
        this.x = x ? x : 0;
        this.y = y ? y : 0;
    }

    set(x, y) {
        this.x = x;
        this.y = y;
    }

    clone() {
        let v = new Vec2(this.x, this.y);
        return v;
    }

    scale(n) {
        this.x *= n;
        this.y *= n;
        return this;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    getLength() {
        let lengthSq = this.x * this.x + this.y * this.y;
        return Math.sqrt(lengthSq);
    }

    dot(v) {
        let val = this.x * v.x + this.y * v.y;
        return val;
    }

    getAngle(v) {
        let dotVal = this.dot(v);
        let t = dotVal / (this.getLength() * v.getLength());
        let angle = Math.acos(t) * 180 / Math.PI;
        return angle;
    }
}

class Vec3 {
    constructor(x, y, z) {
        this.x = x ? x : 0;
        this.y = y ? y : 0;
        this.z = z ? z : 0;
    }

    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    clone() {
        let v = new Vec3(this.x, this.y, this.z);
        return v;
    }

    scale(n) {
        this.x *= n;
        this.y *= n;
        this.z *= n;
        return this;
    }

    getLength() {
        let lengthSq = this.x * this.x + this.y * this.y + this.z * this.z;
        return Math.sqrt(lengthSq);
    }

    getLengthSq() {
        let lengthSq = this.x * this.x + this.y * this.y + this.z * this.z;
        return lengthSq;
    }

    normalizeXY() {
        let lengthSq = this.x * this.x + this.y * this.y;
        if (lengthSq > 0) {
            var invLength = 1 / Math.sqrt(lengthSq);
            this.x *= invLength;
            this.y *= invLength;
            this.z *= invLength;
        }
        return this;
    }

    normalize() {
        let lengthSq = this.x * this.x + this.y * this.y + this.z * this.z;
        if (lengthSq > 0) {
            var invLength = 1 / Math.sqrt(lengthSq);
            this.x *= invLength;
            this.y *= invLength;
            this.z *= invLength;
        }
        return this;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }

    distance(v) {
        let diff = this.clone().sub(v);
        let d = diff.getLength();
        return d;
    }

    dot(v) {
        let val = this.x * v.x + this.y * v.y + this.z * v.z;
        return val;
    }

    getAngle(v) {
        let dotVal = this.dot(v);
        let t = dotVal / (this.getLength() * v.getLength());
        let angle = Math.acos(t) * 180 / Math.PI;
        return angle;
    }

    applyMatrix4(m) {

        const x = this.x, y = this.y, z = this.z;
        
        const e = m.data;
        const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);

        this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
        this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
        this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;

        return this;

    }
}

class Quat {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 0;
    }

    setFromMat4(m) {
        let quat = this;
        let m00, m01, m02, m10, m11, m12, m20, m21, m22,
            tr, s, rs, lx, ly, lz;

        // Cache matrix values for super-speed
        m00 = m.data[0];
        m01 = m.data[4];
        m02 = m.data[8];
        m10 = m.data[1];
        m11 = m.data[5];
        m12 = m.data[9];
        m20 = m.data[2];
        m21 = m.data[6];
        m22 = m.data[10];

        // Remove the scale from the matrix
        lx = m00 * m00 + m01 * m01 + m02 * m02;
        if (lx === 0)
            return quat;
        lx = 1 / Math.sqrt(lx);
        ly = m10 * m10 + m11 * m11 + m12 * m12;
        if (ly === 0)
            return quat;
        ly = 1 / Math.sqrt(ly);
        lz = m20 * m20 + m21 * m21 + m22 * m22;
        if (lz === 0)
            return quat;
        lz = 1 / Math.sqrt(lz);

        m00 *= lx;
        m01 *= lx;
        m02 *= lx;
        m10 *= ly;
        m11 *= ly;
        m12 *= ly;
        m20 *= lz;
        m21 *= lz;
        m22 *= lz;

        tr = m00 + m11 + m22;
        if (tr >= 0) {
            s = Math.sqrt(tr + 1);
            quat.w = s * 0.5;
            s = 0.5 / s;
            quat.x = (m12 - m21) * s;
            quat.y = (m20 - m02) * s;
            quat.z = (m01 - m10) * s;
        } else {
            if (m00 > m11) {
                if (m00 > m22) {
                    // XDiagDomMatrix
                    rs = (m00 - (m11 + m22)) + 1;
                    rs = Math.sqrt(rs);

                    quat.x = rs * 0.5;
                    rs = 0.5 / rs;
                    quat.w = (m12 - m21) * rs;
                    quat.y = (m01 + m10) * rs;
                    quat.z = (m02 + m20) * rs;
                } else {
                    // ZDiagDomMatrix
                    rs = (m22 - (m00 + m11)) + 1;
                    rs = Math.sqrt(rs);

                    quat.z = rs * 0.5;
                    rs = 0.5 / rs;
                    quat.w = (m01 - m10) * rs;
                    quat.x = (m20 + m02) * rs;
                    quat.y = (m21 + m12) * rs;
                }
            } else if (m11 > m22) {
                // YDiagDomMatrix
                rs = (m11 - (m22 + m00)) + 1;
                rs = Math.sqrt(rs);

                quat.y = rs * 0.5;
                rs = 0.5 / rs;
                quat.w = (m20 - m02) * rs;
                quat.z = (m12 + m21) * rs;
                quat.x = (m10 + m01) * rs;
            } else {
                // ZDiagDomMatrix
                rs = (m22 - (m00 + m11)) + 1;
                rs = Math.sqrt(rs);

                quat.z = rs * 0.5;
                rs = 0.5 / rs;
                quat.w = (m01 - m10) * rs;
                quat.x = (m20 + m02) * rs;
                quat.y = (m21 + m12) * rs;
            }
        }

        return quat;
    }

    toEuler(target, order) {
        order = order || "YZX";

        let heading, attitude, bank;
        let x = this.x, y = this.y, z = this.z, w = this.w;

        switch (order) {
            case "YZX":
                let test = x * y + z * w;
                if (test > 0.499) { // singularity at north pole
                    heading = 2 * Math.atan2(x, w);
                    attitude = Math.PI / 2;
                    bank = 0;
                }
                if (test < -0.499) { // singularity at south pole
                    heading = -2 * Math.atan2(x, w);
                    attitude = -Math.PI / 2;
                    bank = 0;
                }
                if (isNaN(heading)) {
                    var sqx = x * x;
                    var sqy = y * y;
                    var sqz = z * z;
                    heading = Math.atan2(2 * y * w - 2 * x * z, 1 - 2 * sqy - 2 * sqz); // Heading
                    attitude = Math.asin(2 * test); // attitude
                    bank = Math.atan2(2 * x * w - 2 * y * z, 1 - 2 * sqx - 2 * sqz); // bank
                }
                break;
            default:
                throw new Error("Euler order " + order + " not supported yet.");
        }

        target = target || {};
        target.x = bank;
        target.y = heading;
        target.z = attitude;
        return target;
    }
}

class Mat4 {
    constructor() {
        let data = new Float32Array(16);
        data[0] = data[5] = data[10] = data[15] = 1;
        this.data = data;
    }

    set(m) {
        for (let i = 0; i < m.length; i++) {
            this.data[i] = m[i];
        }
        return this;
    }

    clone() {
        let m = new Mat4();
        m.set(this.data);
        return m;
    }

    transpose() {
        let te = this.data;
        let tmp;

        tmp = te[1]; te[1] = te[4]; te[4] = tmp;
        tmp = te[2]; te[2] = te[8]; te[8] = tmp;
        tmp = te[6]; te[6] = te[9]; te[9] = tmp;

        tmp = te[3]; te[3] = te[12]; te[12] = tmp;
        tmp = te[7]; te[7] = te[13]; te[13] = tmp;
        tmp = te[11]; te[11] = te[14]; te[14] = tmp;

        return this;
    }

    getInverse() {
        let me = this.data;
        let te = [],
            n11 = me[0], n21 = me[1], n31 = me[2], n41 = me[3],
            n12 = me[4], n22 = me[5], n32 = me[6], n42 = me[7],
            n13 = me[8], n23 = me[9], n33 = me[10], n43 = me[11],
            n14 = me[12], n24 = me[13], n34 = me[14], n44 = me[15],

            t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
            t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
            t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
            t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

        let det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

        if (det === 0) {
            throw new Error('error!');
        }

        let detInv = 1 / det;

        te[0] = t11 * detInv;
        te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
        te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
        te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;

        te[4] = t12 * detInv;
        te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
        te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
        te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;

        te[8] = t13 * detInv;
        te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
        te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
        te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;

        te[12] = t14 * detInv;
        te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
        te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
        te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;

        this.data = te;
        return this;
    }

    compose(position, quaternion, scale) {

        const te = this.data;

        const x = quaternion.x, y = quaternion.y, z = quaternion.z, w = quaternion.w;
        const x2 = x + x, y2 = y + y, z2 = z + z;
        const xx = x * x2, xy = x * y2, xz = x * z2;
        const yy = y * y2, yz = y * z2, zz = z * z2;
        const wx = w * x2, wy = w * y2, wz = w * z2;

        const sx = scale.x, sy = scale.y, sz = scale.z;

        te[0] = (1 - (yy + zz)) * sx;
        te[1] = (xy + wz) * sx;
        te[2] = (xz - wy) * sx;
        te[3] = 0;

        te[4] = (xy - wz) * sy;
        te[5] = (1 - (xx + zz)) * sy;
        te[6] = (yz + wx) * sy;
        te[7] = 0;

        te[8] = (xz + wy) * sz;
        te[9] = (yz - wx) * sz;
        te[10] = (1 - (xx + yy)) * sz;
        te[11] = 0;

        te[12] = position.x;
        te[13] = position.y;
        te[14] = position.z;
        te[15] = 1;

        return this;

    }

    determinant() {

        const te = this.data;

        const n11 = te[0], n12 = te[4], n13 = te[8], n14 = te[12];
        const n21 = te[1], n22 = te[5], n23 = te[9], n24 = te[13];
        const n31 = te[2], n32 = te[6], n33 = te[10], n34 = te[14];
        const n41 = te[3], n42 = te[7], n43 = te[11], n44 = te[15];

        return (
            n41 * (
                +n14 * n23 * n32
                - n13 * n24 * n32
                - n14 * n22 * n33
                + n12 * n24 * n33
                + n13 * n22 * n34
                - n12 * n23 * n34
            ) +
            n42 * (
                +n11 * n23 * n34
                - n11 * n24 * n33
                + n14 * n21 * n33
                - n13 * n21 * n34
                + n13 * n24 * n31
                - n14 * n23 * n31
            ) +
            n43 * (
                +n11 * n24 * n32
                - n11 * n22 * n34
                - n14 * n21 * n32
                + n12 * n21 * n34
                + n14 * n22 * n31
                - n12 * n24 * n31
            ) +
            n44 * (
                -n13 * n22 * n31
                - n11 * n23 * n32
                + n11 * n22 * n33
                + n13 * n21 * n32
                - n12 * n21 * n33
                + n12 * n23 * n31
            )

        );

    }

    decompose() {

        const te = this.data;

        let sx = new Vec3(te[0], te[1], te[2]).getLength();
        let sy = new Vec3(te[4], te[5], te[6]).getLength();
        let sz = new Vec3(te[8], te[9], te[10]).getLength();

        // if determine is negative, we need to invert one scale
        const det = this.determinant();
        if (det < 0) sx = -sx;

        let position = new Vec3(te[12], te[13], te[14]);

        // scale the rotation part
        let rotation = new Mat4();
        rotation.set(this.data);

        const invSX = 1 / sx;
        const invSY = 1 / sy;
        const invSZ = 1 / sz;

        rotation.data[0] *= invSX;
        rotation.data[1] *= invSX;
        rotation.data[2] *= invSX;

        rotation.data[4] *= invSY;
        rotation.data[5] *= invSY;
        rotation.data[6] *= invSY;

        rotation.data[8] *= invSZ;
        rotation.data[9] *= invSZ;
        rotation.data[10] *= invSZ;

        let scale = new Vec3(sx, sy, sz);
        scale.x = sx;
        scale.y = sy;
        scale.z = sz;

        return { position, rotation, scale };
    }

    multiplyMatrices(a, b) {

        const ae = a.data;
        const be = b.data;
        const te = this.data;

        const a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
        const a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
        const a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
        const a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

        const b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
        const b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
        const b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
        const b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];

        te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
        te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
        te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
        te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

        te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
        te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
        te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
        te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

        te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
        te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
        te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
        te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

        te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
        te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
        te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
        te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

        return this;

    }

    makePerspective(left, right, top, bottom, near, far) {

        if (far === undefined) {

            console.warn('THREE.Matrix4: .makePerspective() has been redefined and has a new signature. Please check the docs.');

        }

        const te = this.data;
        const x = 2 * near / (right - left);
        const y = 2 * near / (top - bottom);

        const a = (right + left) / (right - left);
        const b = (top + bottom) / (top - bottom);
        const c = - (far + near) / (far - near);
        const d = - 2 * far * near / (far - near);

        te[0] = x; te[4] = 0; te[8] = a; te[12] = 0;
        te[1] = 0; te[5] = y; te[9] = b; te[13] = 0;
        te[2] = 0; te[6] = 0; te[10] = c; te[14] = d;
        te[3] = 0; te[7] = 0; te[11] = - 1; te[15] = 0;

        return this;

    }

    makeOrthographic(left, right, top, bottom, near, far) {

        const te = this.data;
        const w = 1.0 / (right - left);
        const h = 1.0 / (top - bottom);
        const p = 1.0 / (far - near);

        const x = (right + left) * w;
        const y = (top + bottom) * h;
        const z = (far + near) * p;

        te[0] = 2 * w; te[4] = 0; te[8] = 0; te[12] = - x;
        te[1] = 0; te[5] = 2 * h; te[9] = 0; te[13] = - y;
        te[2] = 0; te[6] = 0; te[10] = - 2 * p; te[14] = - z;
        te[3] = 0; te[7] = 0; te[11] = 0; te[15] = 1;

        return this;

    }
}

export { Vec2, Vec3, Quat, Mat4 };