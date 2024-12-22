@group(0) @binding(0) var<storage, read> secrets: array<u32>;
@group(0) @binding(1) var<storage, read_write> scores: array<atomic<u32>, 130321>;

@compute @workgroup_size(256) fn main(
    @builtin(global_invocation_id) global_id: vec3<u32>
) {
    var seen = array<u32, 2000>();
    var secret: u32 = secrets[global_id.x];
    var last_4: u32 = 0u;
    var price: u32 = secret % 10u;

    for (var run = 1; run <= 2000; run++) {
        secret ^= secret << 6u;
        secret &= 0xFFFFFFu;
        secret ^= secret >> 5u;
        secret ^= secret << 11u;
        secret &= 0xFFFFFFu;
        last_4 *= 19u;
        last_4 %= 130321u;
        last_4 += 9u + (secret % 10u) - price;
        price = secret % 10u;
        if (price == 0u) { continue; }
        if (run < 4) { continue; }
        for (var index = 0; index < 2000; index++){
            if (seen[index] == last_4) { break; }
            if (seen[index] > 0u) { continue; }
            seen[index] = last_4;
            if (price > 0u) { atomicAdd(&scores[last_4], price); }
            break;
        }
    }
}
