import cv2
import numpy as np
import os
import shutil

print("Starting 10-Second 3D Logo Branding Video Render...")

# 1. Load Assets
logo_hd = cv2.imread('public/respire_logo_perfect_hd.png', cv2.IMREAD_UNCHANGED)
bg_raw = cv2.imread('clean_ref_bg.jpg')

h_bg, w_bg, _ = bg_raw.shape  # 720, 1280
h_logo, w_logo, _ = logo_hd.shape

# Pre-compute 3D bevel and normal maps for logo
alpha = logo_hd[:, :, 3]
color = logo_hd[:, :, :3]
mask = (alpha > 120).astype(np.uint8)

# Distance transform for bevel
dist = cv2.distanceTransform(mask, cv2.DIST_L2, 5)
bevel = np.clip(dist / 6.0, 0.0, 1.0)
sobelx = cv2.Sobel(bevel, cv2.CV_64F, 1, 0, ksize=3)
sobely = cv2.Sobel(bevel, cv2.CV_64F, 0, 1, ksize=3)

nz = 0.6
norm = np.sqrt(sobelx**2 + sobely**2 + nz**2)
nx = -sobelx / norm
ny = -sobely / norm
nz = nz / norm

def render_shaded_logo(light_pos_norm):
    # light_pos_norm is (lx, ly, lz)
    lx, ly, lz = light_pos_norm
    diffuse = np.clip(nx * lx + ny * ly + nz * lz, 0.0, 1.0)
    
    # Blinn-Phong specular
    vx, vy, vz = 0.0, 0.0, 1.0
    hx, hy, hz = lx + vx, ly + vy, lz + vz
    h_mag = np.sqrt(hx**2 + hy**2 + hz**2)
    hx, hy, hz = hx/h_mag, hy/h_mag, hz/h_mag
    spec = np.clip(nx * hx + ny * hy + nz * hz, 0.0, 1.0) ** 28
    
    shaded = color.astype(float) * (0.45 + 0.55 * diffuse[:, :, None]) + 255.0 * spec[:, :, None] * 0.95
    shaded = np.clip(shaded, 0, 255).astype(np.uint8)
    return np.dstack([shaded, alpha])

# Pre-render 3 lighting states
logo_shaded = render_shaded_logo((-0.5, -0.6, 0.8))

# Video parameters
FPS = 30
TOTAL_FRAMES = 300  # Exactly 10.0 seconds
OUT_PATH = 'public/respire_branding_10s.mp4'

fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(OUT_PATH, fourcc, float(FPS), (w_bg, h_bg))

src_pts = np.float32([[0, 0], [w_logo, 0], [w_logo, h_logo], [0, h_logo]])

print(f"Rendering {TOTAL_FRAMES} frames...")

for frame_idx in range(TOTAL_FRAMES):
    t_sec = frame_idx / float(FPS)
    frame_bg = bg_raw.copy()
    
    # ==========================================
    # SCENE 1: Close-up 3D Pan Left-to-Right (0.0s to 3.3s, frames 0-99)
    # ==========================================
    if frame_idx < 100:
        p = frame_idx / 99.0  # 0 to 1
        
        # Smooth camera pan across logo from left to right
        # X shifts smoothly
        x_shift = -320.0 + p * 240.0
        y_shift = 10.0 * np.sin(p * np.pi)
        
        dst_pts = np.float32([
            [x_shift, 490 + y_shift],
            [x_shift + 1550, 250 + y_shift],
            [x_shift + 1520, 480 + y_shift],
            [x_shift + 20, 700 + y_shift]
        ])
        
        M = cv2.getPerspectiveTransform(src_pts, dst_pts)
        warped = cv2.warpPerspective(logo_shaded, M, (w_bg, h_bg), flags=cv2.INTER_LANCZOS4)
        
        # Sheen glint travelling across
        glint_x = int(w_bg * (p * 1.3 - 0.15))
        
        # Shadow
        shadow_mask = cv2.GaussianBlur(warped[:, :, 3], (31, 31), 0)
        M_sh = np.float32([[1, 0, 6], [0, 1, 16]])
        s_shifted = cv2.warpAffine(shadow_mask, M_sh, (w_bg, h_bg))
        s_alpha = (s_shifted / 255.0)[:, :, None] * 0.72
        
        frame_bg = (frame_bg.astype(float) * (1.0 - s_alpha)).astype(np.uint8)
        
        w_alpha = (warped[:, :, 3] / 255.0)[:, :, None]
        w_rgb = warped[:, :, :3].astype(float)
        
        # Specular glint
        Y_grid, X_grid = np.ogrid[:h_bg, :w_bg]
        glint_mask = np.exp(-((X_grid - glint_x) * 0.8 - (Y_grid - 360) * 0.4)**2 / (60.0**2))
        glint_boost = glint_mask[:, :, None] * 120.0 * w_alpha
        w_rgb = np.clip(w_rgb + glint_boost, 0, 255)
        
        frame = (w_rgb * w_alpha + frame_bg.astype(float) * (1.0 - w_alpha)).astype(np.uint8)
        
        # Fade in from black at very start (first 12 frames)
        if frame_idx < 12:
            fade = frame_idx / 12.0
            frame = (frame.astype(float) * fade).astype(np.uint8)
        # Crossfade transition to scene 2 at frames 88-99
        elif frame_idx >= 88:
            fade_out = (99 - frame_idx) / 12.0
            frame = (frame.astype(float) * fade_out).astype(np.uint8)

    # ==========================================
    # SCENE 2: Reverse 3D Isometric Angle (3.3s to 6.6s, frames 100-199)
    # ==========================================
    elif frame_idx < 200:
        p = (frame_idx - 100) / 99.0  # 0 to 1
        
        # Reverse angle pan from right to left
        x_shift = 180.0 - p * 220.0
        scale = 1.04 - 0.06 * p
        
        dst_pts = np.float32([
            [x_shift - 150, 220],
            [x_shift + 1380 * scale, 440],
            [x_shift + 1360 * scale, 660],
            [x_shift - 130, 430]
        ])
        
        M = cv2.getPerspectiveTransform(src_pts, dst_pts)
        warped = cv2.warpPerspective(logo_shaded, M, (w_bg, h_bg), flags=cv2.INTER_LANCZOS4)
        
        # Shadow
        shadow_mask = cv2.GaussianBlur(warped[:, :, 3], (31, 31), 0)
        M_sh = np.float32([[1, 0, -6], [0, 1, 16]])
        s_shifted = cv2.warpAffine(shadow_mask, M_sh, (w_bg, h_bg))
        s_alpha = (s_shifted / 255.0)[:, :, None] * 0.72
        
        frame_bg = (frame_bg.astype(float) * (1.0 - s_alpha)).astype(np.uint8)
        
        w_alpha = (warped[:, :, 3] / 255.0)[:, :, None]
        w_rgb = warped[:, :, :3].astype(float)
        
        # Glint moving along reverse direction
        glint_x = int(w_bg * (1.1 - p * 1.2))
        Y_grid, X_grid = np.ogrid[:h_bg, :w_bg]
        glint_mask = np.exp(-((X_grid - glint_x) * 0.7 + (Y_grid - 360) * 0.5)**2 / (65.0**2))
        glint_boost = glint_mask[:, :, None] * 130.0 * w_alpha
        w_rgb = np.clip(w_rgb + glint_boost, 0, 255)
        
        frame = (w_rgb * w_alpha + frame_bg.astype(float) * (1.0 - w_alpha)).astype(np.uint8)
        
        # Fade in transition (frames 100-112)
        if frame_idx < 112:
            fade = (frame_idx - 100) / 12.0
            frame = (frame.astype(float) * fade).astype(np.uint8)
        # Fade out transition (frames 188-199)
        elif frame_idx >= 188:
            fade_out = (199 - frame_idx) / 12.0
            frame = (frame.astype(float) * fade_out).astype(np.uint8)

    # ==========================================
    # SCENE 3: Majestic Center Reveal & Full Glint Sweep (6.6s to 10.0s, frames 200-299)
    # ==========================================
    else:
        p = (frame_idx - 200) / 99.0  # 0 to 1
        
        # Smooth camera pull-back from scale 1.05 down to 1.00
        cur_scale = 1.05 - 0.05 * (1.0 - (1.0 - p)**2)
        target_w = int(880 * cur_scale)
        target_h = int(h_logo * (target_w / float(w_logo)))
        
        logo_res = cv2.resize(logo_shaded, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
        
        ox = (w_bg - target_w) // 2
        oy = (h_bg - target_h) // 2
        
        # Ambient emerald nebula glow behind logo
        glow_radius = 260
        Y_grid, X_grid = np.ogrid[:h_bg, :w_bg]
        dist_c = np.sqrt((X_grid - 640)**2 + (Y_grid - 360)**2)
        glow_mask = np.clip(1.0 - dist_c / glow_radius, 0.0, 1.0)**2
        # Soft green tint (BGR: 40, 180, 0)
        frame_bg[:, :, 0] = np.clip(frame_bg[:, :, 0] + glow_mask * 15, 0, 255).astype(np.uint8)
        frame_bg[:, :, 1] = np.clip(frame_bg[:, :, 1] + glow_mask * 55, 0, 255).astype(np.uint8)
        frame_bg[:, :, 2] = np.clip(frame_bg[:, :, 2] + glow_mask * 10, 0, 255).astype(np.uint8)
        
        # Embossed contact shadow
        shadow_mask = cv2.GaussianBlur(logo_res[:, :, 3], (35, 35), 0)
        s_alpha = (shadow_mask / 255.0)[:, :, None] * 0.8
        sy = min(h_bg, oy + 12)
        sx = min(w_bg, ox + 4)
        sh = min(target_h, h_bg - sy)
        sw = min(target_w, w_bg - sx)
        frame_bg[sy:sy+sh, sx:sx+sw] = (frame_bg[sy:sy+sh, sx:sx+sw].astype(float) * (1.0 - s_alpha[:sh, :sw])).astype(np.uint8)
        
        # Radiant metallic sheen glint sweep across full wordmark from left to right (p from 0.15 to 0.85)
        w_alpha = (logo_res[:, :, 3] / 255.0)[:, :, None]
        w_rgb = logo_res[:, :, :3].astype(float)
        
        sweep_p = (p - 0.12) / 0.65  # 0 to 1 between p=0.12 and p=0.77
        if 0.0 <= sweep_p <= 1.0:
            glint_x_local = int(target_w * (sweep_p * 1.3 - 0.15))
            Y_l, X_l = np.ogrid[:target_h, :target_w]
            # Diagonal beam at 65 degrees
            beam = np.exp(-((X_l - glint_x_local) - (Y_l - target_h/2.0) * 0.4)**2 / (38.0**2))
            w_rgb = np.clip(w_rgb + beam[:, :, None] * 160.0 * w_alpha, 0, 255)
        
        # Composite
        frame_bg[oy:oy+target_h, ox:ox+target_w] = (
            w_rgb * w_alpha + frame_bg[oy:oy+target_h, ox:ox+target_w].astype(float) * (1.0 - w_alpha)
        ).astype(np.uint8)
        
        frame = frame_bg
        
        # Fade in transition at start of scene 3 (frames 200-212)
        if frame_idx < 212:
            fade = (frame_idx - 200) / 12.0
            frame = (frame.astype(float) * fade).astype(np.uint8)
        # Final graceful cinematic fade-out at end (frames 275-299)
        elif frame_idx >= 275:
            fade_out = (299 - frame_idx) / 24.0
            frame = (frame.astype(float) * fade_out).astype(np.uint8)
            
    out.write(frame)
    if frame_idx % 60 == 0:
        print(f"Rendered {frame_idx}/{TOTAL_FRAMES} frames ({t_sec:.1f}s)...")

out.release()
print("10-Second Video Render Completed Successfully at:", OUT_PATH)

# Copy to user's Downloads directory as requested
downloads_target = r'C:\Users\hp\Downloads\0_Logo_Branding_1280x720_Respire_10s.mp4'
try:
    shutil.copyfile(OUT_PATH, downloads_target)
    print(f"Copied to Downloads folder: {downloads_target}")
except Exception as e:
    print(f"Downloads copy notice: {e}")
