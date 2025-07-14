import sys
try:
    import pygame
except ModuleNotFoundError:
    print("Error: pygame is not installed. Run 'pip install -r requirements.txt' and try again.")
    sys.exit(1)
import random

# Game configuration
WIDTH, HEIGHT = 800, 600
FPS = 60

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (200, 0, 0)
GREEN = (0, 200, 0)
BLUE = (0, 0, 200)

# Player settings
TRUCK_SIZE = (40, 20)
TRUCK_SPEED = 5

# Enemy settings
NUM_MINES = 10
NUM_TANKS = 3
TANK_SPEED = 2

pygame.init()
pygame.display.set_caption("WW2 Resupply Run")
screen = pygame.display.set_mode((WIDTH, HEIGHT))
clock = pygame.time.Clock()

font = pygame.font.SysFont(None, 36)

class Truck(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.image = pygame.Surface(TRUCK_SIZE)
        self.image.fill(BLUE)
        self.rect = self.image.get_rect(center=(WIDTH // 2, HEIGHT - 50))

    def update(self, keys):
        if keys[pygame.K_LEFT] and self.rect.left > 0:
            self.rect.x -= TRUCK_SPEED
        if keys[pygame.K_RIGHT] and self.rect.right < WIDTH:
            self.rect.x += TRUCK_SPEED
        if keys[pygame.K_UP] and self.rect.top > 0:
            self.rect.y -= TRUCK_SPEED
        if keys[pygame.K_DOWN] and self.rect.bottom < HEIGHT:
            self.rect.y += TRUCK_SPEED

class Mine(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.image = pygame.Surface((20, 20))
        self.image.fill(BLACK)
        self.rect = self.image.get_rect(
            center=(random.randint(20, WIDTH - 20), random.randint(80, HEIGHT - 150))
        )

class Tank(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.image = pygame.Surface((40, 30))
        self.image.fill(RED)
        self.rect = self.image.get_rect(
            center=(random.randint(40, WIDTH - 40), random.randint(80, HEIGHT - 200))
        )
        self.direction = random.choice([-1, 1])

    def update(self):
        self.rect.x += self.direction * TANK_SPEED
        if self.rect.left <= 0 or self.rect.right >= WIDTH:
            self.direction *= -1

player = Truck()
all_sprites = pygame.sprite.Group(player)
mines = pygame.sprite.Group(Mine() for _ in range(NUM_MINES))
tanks = pygame.sprite.Group(Tank() for _ in range(NUM_TANKS))
all_sprites.add(mines, tanks)

running = True
win = False

while running:
    clock.tick(FPS)
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    keys = pygame.key.get_pressed()
    player.update(keys)
    tanks.update()

    if pygame.sprite.spritecollideany(player, mines) or pygame.sprite.spritecollideany(player, tanks):
        running = False
    if player.rect.top <= 10:
        win = True
        running = False

    screen.fill(WHITE)
    pygame.draw.rect(screen, GREEN, (0, 0, WIDTH, 50))  # front line area
    all_sprites.draw(screen)

    screen.blit(font.render("Allies", True, BLUE), (10, 10))
    screen.blit(font.render("Axis", True, RED), (WIDTH - 100, 10))

    pygame.display.flip()

pygame.quit()
if win:
    print("Resupply successful! Allied forces strengthened.")
else:
    print("Mission failed. The front line remains undersupplied.")
