#include <Imlib2.h>
#include <assert.h>
#include <stdio.h>
int main(void) {
    Imlib_Image image = imlib_create_image(4, 4);
    assert(image);
    imlib_context_set_image(image);
    imlib_context_set_color(255, 0, 0, 255);
    imlib_image_fill_rectangle(0, 0, 4, 4);
    imlib_image_set_format("png");
    Imlib_Load_Error error;
    imlib_save_image_with_error_return("/tmp/imlib2-consumer.png", &error);
    assert(error == IMLIB_LOAD_ERROR_NONE);
    imlib_free_image();
    image = imlib_load_image_immediately_without_cache("/tmp/imlib2-consumer.png");
    assert(image);
    imlib_context_set_image(image);
    assert(imlib_image_get_width() == 4 && imlib_image_get_height() == 4);
    DATA32 *pixels = imlib_image_get_data_for_reading_only();
    assert(pixels);
    for (int i = 0; i < 16; ++i) assert((pixels[i] & 0xffffff) == 0xff0000);
    Imlib_Image scaled = imlib_create_cropped_scaled_image(0, 0, 4, 4, 16, 16);
    assert(scaled);
    imlib_free_image();
    imlib_context_set_image(scaled);
    assert(imlib_image_get_width() == 16 && imlib_image_get_height() == 16);
    pixels = imlib_image_get_data_for_reading_only();
    assert(pixels);
    for (int i = 0; i < 256; ++i) assert((pixels[i] & 0xffffff) == 0xff0000);
    imlib_image_set_format("jpeg");
    imlib_save_image_with_error_return("/tmp/imlib2-consumer.jpg", &error);
    assert(error == IMLIB_LOAD_ERROR_NONE);
    imlib_free_image();
    image = imlib_load_image_immediately_without_cache("/tmp/imlib2-consumer.jpg");
    assert(image);
    imlib_context_set_image(image);
    assert(imlib_image_get_width() == 16 && imlib_image_get_height() == 16);
    pixels = imlib_image_get_data_for_reading_only();
    assert(pixels);
    for (int i = 0; i < 256; ++i) {
        assert(((pixels[i] >> 16) & 255) > 245);
        assert(((pixels[i] >> 8) & 255) < 10);
        assert((pixels[i] & 255) < 10);
    }
    imlib_free_image();
    assert(!imlib_load_image("/tmp/imlib2-consumer-no-such-image.png"));
    puts("IMLIB2-HEADLESS-PASS");
    return 0;
}
